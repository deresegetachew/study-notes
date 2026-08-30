# Try It Yourself: Implement Rate Limiting

In this exercise, you'll implement **per-user rate limiting** for the agent API to prevent abuse and control costs.

## Background

From the slides on "Cost Control and Multi-Tenant Fairness":

> **The Risk:** LLM costs scale linearly; one runaway loop can drain budgets instantly.
>
> **Throttling:** Return 429 Too Many Requests rather than over-scaling.

Rate limiting is essential for production agent systems because:
- LLM API calls are expensive
- One user shouldn't monopolize resources
- Prevents accidental infinite loops from draining budgets

## Your Task

Implement rate limiting that:
1. Limits each user to **5 requests per minute**
2. Returns **429 Too Many Requests** when limit exceeded
3. Adds **rate limit headers** to responses

## Files to Modify

| File | What to do |
|------|------------|
| `state_store.py` | Implement 3 rate limiting functions |
| `main.py` | Add rate limit checks to task submission |

## Step-by-Step Guide

### Step 1: Implement Rate Limiting Functions (state_store.py)

Open `state_store.py` and implement these three functions:

#### 1.1 `check_rate_limit(user_id)`

Check if a user is within their rate limit.

```python
def check_rate_limit(user_id: str) -> Tuple[bool, int, int]:
    """
    Returns: (is_allowed, current_count, max_allowed)
    """
    client = get_redis_client()
    key = _rate_limit_key(user_id)

    current_count = client.get(key)
    if current_count is None:
        current_count = 0
    else:
        current_count = int(current_count)

    is_allowed = current_count < RATE_LIMIT_MAX_REQUESTS

    return (is_allowed, current_count, RATE_LIMIT_MAX_REQUESTS)
```

#### 1.2 `increment_rate_limit(user_id)`

Increment the counter after a successful request.

```python
def increment_rate_limit(user_id: str) -> int:
    """
    Returns: New count after incrementing
    """
    client = get_redis_client()
    key = _rate_limit_key(user_id)

    # INCR creates key with value 1 if doesn't exist
    new_count = client.incr(key)

    # Set TTL on first request in window
    if new_count == 1:
        client.expire(key, RATE_LIMIT_WINDOW_SECONDS)

    return new_count
```

#### 1.3 `get_rate_limit_status(user_id)`

Get detailed status for response headers.

```python
def get_rate_limit_status(user_id: str) -> dict:
    client = get_redis_client()
    key = _rate_limit_key(user_id)

    current_count = client.get(key)
    if current_count is None:
        current_count = 0
    else:
        current_count = int(current_count)

    ttl = client.ttl(key)
    if ttl < 0:
        ttl = RATE_LIMIT_WINDOW_SECONDS

    remaining = max(0, RATE_LIMIT_MAX_REQUESTS - current_count)

    return {
        "limit": RATE_LIMIT_MAX_REQUESTS,
        "remaining": remaining,
        "reset_seconds": ttl,
        "window_seconds": RATE_LIMIT_WINDOW_SECONDS
    }
```

### Step 2: Test Your Rate Limiting Functions

Run the built-in tests:

```bash
# Make sure Redis is running
redis-server

# Run tests
python state_store.py
```

Expected output:
```
Testing Rate Limiting Implementation...
============================================================

1. Checking initial rate limit...
   Allowed: True, Current: 0, Max: 5

2. Incrementing rate limit...
   After increment 1: count = 1
   After increment 2: count = 2
   After increment 3: count = 3
   Allowed: True, Current: 3, Max: 5

3. Hitting the rate limit...
   Allowed: False, Current: 5, Max: 5

4. Getting rate limit status...
   Status: {'limit': 5, 'remaining': 0, 'reset_seconds': 58, 'window_seconds': 60}

============================================================
All tests passed! Your implementation is correct.
```

### Step 3: Integrate Rate Limiting into API (main.py)

Open `main.py` and make these changes:

#### 3.1 Import the functions

```python
from state_store import (
    # ... existing imports ...
    check_rate_limit,
    increment_rate_limit,
    get_rate_limit_status,
)
```

#### 3.2 Add rate limit check to `submit_task()`

Add this at the beginning of the function:

```python
@app.post("/tasks", response_model=TaskSubmitResponse)
def submit_task(
    request: TaskSubmitRequest,
    response: Response,
    x_user_id: str = Header(..., description="User identifier")
):
    user_id = get_user_id(x_user_id)

    # Check rate limit BEFORE creating task
    is_allowed, current_count, max_allowed = check_rate_limit(user_id)

    if not is_allowed:
        status = get_rate_limit_status(user_id)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. You have made {current_count}/{max_allowed} requests. "
                   f"Try again in {status['reset_seconds']} seconds."
        )

    # ... rest of the function ...
```

#### 3.3 Increment counter after task creation

Add this after the task is successfully created:

```python
    # After celery_result = run_agent_task.delay(...)

    # Increment rate limit counter
    increment_rate_limit(user_id)

    # Add rate limit headers
    add_rate_limit_headers(response, user_id)

    return TaskSubmitResponse(...)
```

#### 3.4 Implement `add_rate_limit_headers()`

```python
def add_rate_limit_headers(response: Response, user_id: str):
    status = get_rate_limit_status(user_id)
    response.headers["X-RateLimit-Limit"] = str(status["limit"])
    response.headers["X-RateLimit-Remaining"] = str(status["remaining"])
    response.headers["X-RateLimit-Reset"] = str(status["reset_seconds"])
```

## Testing Your Implementation

### Start the Services

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Celery worker
celery -A tasks worker --loglevel=info

# Terminal 3: API
uvicorn main:app --reload
```

### Test Rate Limiting

```bash
# Submit 5 tasks (should all succeed)
for i in {1..5}; do
  echo "Request $i:"
  curl -s -X POST http://localhost:8000/tasks \
    -H "Content-Type: application/json" \
    -H "X-User-ID: test-user" \
    -d '{"query": "Test query '$i'"}' | jq -r '.status // .detail'
  echo ""
done

# 6th request should fail with 429
echo "Request 6 (should fail):"
curl -s -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"query": "This should be rate limited"}' | jq '.'
```

Expected output:
```
Request 1: queued
Request 2: queued
Request 3: queued
Request 4: queued
Request 5: queued

Request 6 (should fail):
{
  "detail": "Rate limit exceeded. You have made 5/5 requests. Try again in 55 seconds."
}
```

### Check Rate Limit Headers

```bash
curl -i -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -H "X-User-ID: another-user" \
  -d '{"query": "Check headers"}'
```

Look for these headers in the response:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 60
```

### Bonus: Implement the Rate Limit Status Endpoint

Implement `GET /rate-limit` so users can check their status:

```bash
curl http://localhost:8000/rate-limit -H "X-User-ID: test-user"
```

Expected:
```json
{
  "limit": 5,
  "remaining": 0,
  "reset_seconds": 45,
  "window_seconds": 60
}
```

## Configuration

Rate limits are configurable via environment variables:

```bash
# In .env or docker-compose.yml
RATE_LIMIT_MAX_REQUESTS=5    # Requests per window
RATE_LIMIT_WINDOW_SECONDS=60  # Window duration (1 minute)
```

## Solution

If you get stuck, check `state_store_solution.py` and `main_solution.py` for complete implementations.

## Key Concepts

1. **Redis INCR** - Atomic counter increment, creates key if doesn't exist
2. **Redis EXPIRE** - Set TTL so counters auto-cleanup
3. **Minute-based windows** - Simple time windowing using timestamp in key
4. **Rate limit headers** - Standard practice for communicating limits to clients

## What You Learned

- How to implement rate limiting with Redis
- Using atomic Redis operations (INCR, EXPIRE)
- Adding custom headers to FastAPI responses
- Returning appropriate HTTP status codes (429)
