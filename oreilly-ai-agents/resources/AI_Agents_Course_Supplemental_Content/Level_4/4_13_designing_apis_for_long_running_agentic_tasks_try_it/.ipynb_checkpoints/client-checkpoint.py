"""
Client for Long-Running Agent Tasks

=============================================================================
TRY IT YOURSELF: Add SSE Streaming Client
=============================================================================

OBJECTIVE:
    Implement a streaming client that connects to the SSE endpoint and
    receives real-time progress updates instead of polling.

YOUR TASK:
    1. Implement the `run_with_streaming()` function
    2. Use the `sseclient-py` library to consume SSE events
    3. Handle different event types: "status", "complete", "error"
    4. Display progress updates in real-time

SSE CLIENT BASICS:
    ```python
    import sseclient

    response = requests.get(url, stream=True)
    client = sseclient.SSEClient(response)

    for event in client.events():
        print(f"Event type: {event.event}")
        print(f"Event data: {event.data}")
    ```

EXPECTED OUTPUT:
    When running with --stream flag:

    ======================================================================
    LONG-RUNNING AGENT TASK CLIENT (STREAMING MODE)
    ======================================================================

    Query: What AI products were launched by...

    [1] Submitting task...
        Task ID: abc123-...

    [2] Streaming progress updates...
        [status] running | analyzing_query
        [status] running | executing_search_step_1_of_2
        [status] running | executing_search_step_2_of_2
        [status] running | synthesizing_results
        [complete] Task finished!

    [3] Result received via stream!

    ======================================================================
    RESULT
    ======================================================================
    ...

HINTS:
    1. Install sseclient-py: pip install sseclient-py
    2. Use requests with stream=True to keep connection open
    3. Parse event.data as JSON: json.loads(event.data)
    4. Handle connection errors gracefully

=============================================================================

Usage:
    python client.py "Your query" --stream          # Use SSE streaming
    python client.py "Your query"                   # Use polling (existing)
    python client.py "Your query" --stream --url http://localhost:8000
"""

import argparse
import json
import time
import sys

import requests

# TODO: Uncomment after installing sseclient-py
# import sseclient


API_BASE_URL = "http://localhost:8000"


# -----------------------------------------------------------------------------
# Existing Polling Implementation (Already Works)
# -----------------------------------------------------------------------------

def submit_task(query: str) -> str:
    """Submit a new task to the server."""
    response = requests.post(
        f"{API_BASE_URL}/tasks",
        json={"query": query}
    )

    if not response.ok:
        print(f"Error submitting task: {response.status_code}")
        print(response.text)
        sys.exit(1)

    data = response.json()
    return data["task_id"]


def poll_status(task_id: str) -> dict:
    """Poll the status of a task."""
    response = requests.get(f"{API_BASE_URL}/tasks/{task_id}")

    if not response.ok:
        print(f"Error polling status: {response.status_code}")
        print(response.text)
        sys.exit(1)

    return response.json()


def get_result(task_id: str) -> dict:
    """Get the final result of a completed task."""
    response = requests.get(f"{API_BASE_URL}/tasks/{task_id}/result")

    if not response.ok:
        print(f"Error getting result: {response.status_code}")
        print(response.text)
        sys.exit(1)

    return response.json()


def run_with_polling(query: str, poll_interval: float = 1.0, timeout: float = 300.0) -> dict:
    """Submit a task and poll until completion (existing implementation)."""
    print("=" * 70)
    print("LONG-RUNNING AGENT TASK CLIENT (POLLING MODE)")
    print("=" * 70)
    print(f"\nQuery: {query}")
    print(f"Poll interval: {poll_interval}s | Timeout: {timeout}s")
    print("-" * 70)

    print("\n[1] Submitting task...")
    task_id = submit_task(query)
    print(f"    Task ID: {task_id}")

    print("\n[2] Polling for status...")
    start_time = time.time()
    last_progress = None

    while True:
        elapsed = time.time() - start_time

        if elapsed > timeout:
            print(f"\n    TIMEOUT after {timeout}s")
            sys.exit(1)

        status_data = poll_status(task_id)
        status = status_data["status"]
        progress = status_data.get("progress")
        strategy = status_data.get("execution_strategy")

        if progress != last_progress:
            strategy_str = f" [{strategy}]" if strategy else ""
            print(f"    [{elapsed:5.1f}s] Status: {status}{strategy_str} | Progress: {progress or '-'}")
            last_progress = progress

        if status == "completed":
            print(f"\n    Task completed in {elapsed:.1f}s")
            break
        elif status == "failed":
            error = status_data.get("error", "Unknown error")
            print(f"\n    Task FAILED: {error}")
            sys.exit(1)

        time.sleep(poll_interval)

    print("\n[3] Retrieving result...")
    result = get_result(task_id)

    print("\n" + "=" * 70)
    print("RESULT")
    print("=" * 70)
    print(f"\nExecution Strategy: {result['execution_strategy']}")
    print(f"\nFinal Answer:\n{result['final_answer']}")
    print("\n" + "=" * 70)

    return result


# -----------------------------------------------------------------------------
# TODO: Implement SSE Streaming Client
# -----------------------------------------------------------------------------

def run_with_streaming(query: str, timeout: float = 300.0) -> dict:
    """
    Submit a task and receive real-time updates via SSE streaming.

    TODO: Implement this function!

    Requirements:
    1. Submit the task (use existing submit_task function)
    2. Connect to the SSE streaming endpoint: GET /tasks/{task_id}/stream
    3. Process incoming events and display progress
    4. Handle "status", "complete", and "error" event types
    5. Return the final result

    Example implementation structure:

        # Submit task
        task_id = submit_task(query)

        # Connect to SSE stream
        response = requests.get(
            f"{API_BASE_URL}/tasks/{task_id}/stream",
            stream=True,
            timeout=timeout
        )
        client = sseclient.SSEClient(response)

        # Process events
        for event in client.events():
            data = json.loads(event.data)

            if event.event == "status":
                # Display progress update
                ...
            elif event.event == "complete":
                # Task finished - extract result
                ...
            elif event.event == "error":
                # Task failed
                ...

        return result
    """
    # ==========================================================================
    # YOUR CODE HERE
    # ==========================================================================

    print("=" * 70)
    print("LONG-RUNNING AGENT TASK CLIENT (STREAMING MODE)")
    print("=" * 70)
    print(f"\nQuery: {query}")
    print("-" * 70)

    # Step 1: Submit the task
    print("\n[1] Submitting task...")
    task_id = submit_task(query)
    print(f"    Task ID: {task_id}")

    # Step 2: Connect to SSE stream
    print("\n[2] Connecting to SSE stream...")

    # TODO: Implement SSE streaming logic here
    # - Connect to /tasks/{task_id}/stream with stream=True
    # - Create SSEClient from response
    # - Loop through events and handle each type

    # Placeholder - remove when implementing
    print("\n    ERROR: SSE streaming not implemented yet!")
    print("    This is your task - implement the run_with_streaming() function")
    print("\n    Falling back to polling mode...\n")
    return run_with_polling(query)

    # ==========================================================================
    # END YOUR CODE
    # ==========================================================================


# -----------------------------------------------------------------------------
# Main Entry Point
# -----------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Client for long-running agent tasks"
    )
    parser.add_argument(
        "query",
        help="The query to process"
    )
    parser.add_argument(
        "--stream",
        action="store_true",
        help="Use SSE streaming instead of polling"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=1.0,
        help="Poll interval in seconds for polling mode (default: 1.0)"
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=300.0,
        help="Timeout in seconds (default: 300)"
    )
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="API base URL (default: http://localhost:8000)"
    )

    args = parser.parse_args()

    global API_BASE_URL
    API_BASE_URL = args.url

    if args.stream:
        run_with_streaming(query=args.query, timeout=args.timeout)
    else:
        run_with_polling(
            query=args.query,
            poll_interval=args.interval,
            timeout=args.timeout
        )


if __name__ == "__main__":
    main()
