# Level 2: Building Agents with LangGraph

---

## 2.1 Running Your First Pre-Built Agent

- **What are Pre-Built Agents?**
  - Agent implementations with minimal configuration
  - Handle tool selection and execution automatically
  - Foundation for building autonomous AI systems
- **Why Use Pre-Built Agents?**
  - Rapid prototyping and deployment
  - Battle-tested implementation patterns
  - Easy to extend and customize for specific use cases Introduction to Pre-Built Agents
- **Overview**
  - `create_agent` is an agent builder function in LangChain
  - Creates graph-based agent automatically, built on top of LangGraph
  - Implements ReAct-style reasoning loop
- **Basic Usage Pre-Built Agents in LangChain**
- **The ReAct Loop**
  - Agent receives input and analyzes task
  - Decides which tools to use (if any)
  - Executes tools and receives observations
  - Iterates until reaching final answer
- **Agent Invocation: Use `.invoke()` to execute the agent**
### Agent Execution Flow

- **Creating Tools**
  - Define functions with type hints and docstrings
  - Docstrings help the agent understand tool purpose
  - Automatically converted to tool schemas Defining Tools for Pre-built Agent
- **Model Configuration Parameters**
  - model: Specific model version to use
  - temperature: Controls randomness (0.0-1.0) ■ Low temperature ~ low randomness
  - max_tokens: Maximum response length
  - timeout: Request timeout in seconds Configuring the Model
### Pre-built agents are great for prototyping but often lack production

> requirements like proper error handling, rate limiting, cost controls, observability. Instead, use them to validate ideas quickly, then build proper infrastructure around them. Common Pitfall: Treating Pre-Built as Production Ready

---

## 2.2 Implementing Structured Outputs with JSON and Pydantic

- **The Problem**
  - LLMs naturally generate unstructured text
  - Agents need predictable, parseable outputs
  - Multi-step workflows require consistent data formats
- **Benefits of Structured Output**
  - Seamless interaction between components and agents
  - Reliable parsing and validation
  - Type safety and error reduction
  - Enables tool calling and function execution Why Structured Output
  - Standard for describing JSON structure
  - Defines data types, required fields, and constraints
  - Supported by most LLM providers
### JSON Schemas

### Pydantic Models for Structured Output

- **What is Pydantic?**
  - Python library for data validation using type hints
  - Provides runtime validation and serialization
  - Can generate JSON schemas automatically
### Structured Output with Langchain

---

## 2.3 Integrating External Tools into an Agent

- **Frameworks enable easy tool integration through**
  - Standardized tool interfaces for consistent integration
  - Automatic tool description generation for LLM understanding
  - Built-in orchestration between reasoning and tool execution
- **Practical Example: Web Search with Tavily**
  - Tavily Search demonstrates the pre-built tool integration pattern
  - Same approach applies to other tools (databases, APIs, custom functions)
- **We will extend the pre-built agent from 2.1 with the Tavily tool**
### How Agent Frameworks Enable Tools

### Integrating the Tavily Search Tool

### Adding Tools to Your Agent

- **Tool Selection Guidelines**
  - Start with one tool and test thoroughly
  - Choose tools that provide clear value to your use case
  - Consider API costs and rate limits
- **Error Handling**
  - Tool calls may fail (network issues, API limits)
  - Agent should gracefully handle tool failures
  - Always test edge cases
- **Performance Considerations**
  - More tools = slower decision making
  - Keep tool count minimal per agent (3-5 tools recommended)
  - Use clear, distinct tool descriptions Best Practices for Tool Integration

---

## 2.4 Building Simple Multi-Step LLM Workflows

- **Why Use Chains?**
  - Many real-world tasks require multiple processing steps
  - Break complex problems into manageable components
  - Reusable, modular workflow design
- **Example Use Cases**
  - RAG: Retrieve documents → Format context → Generate answer
  - Report generation: Research → Outline → Write → Review
  - Data processing: Extract → Transform → Analyze → Summarize Chains Revisited
- **Core Building Blocks**
  - Prompt Templates: Structure and format inputs
  - LLM Calls: Process and generate responses
  - Output Parsers: Extract structured data from responses
  - Data Transformations: Process intermediate results
- **Benefits of Modular Design**
  - Easy to test individual components
  - Reusable across different workflows
  - Clear separation of concerns
  - Simplified debugging Chain Components and Design
### Example: Writing Improvement Chain

### Example: RAG Chain

---

## 2.5 Create an Agent Class from Scratch in Python

### Revisiting the ReAct Framework

### Reasoning and Acting Cycle:

- **The agent alternates between thinking (Thought) and doing (Action).**
- **Observes the outcome (Observation) and repeats the cycle until the task is complete.**
### Crafting Effective Prompts

- **Importance of Prompts:**
  - Direct the agent's reasoning and actions.
  - Define how the agent should think and respond.
- **Prompt Structure:**
  - Instructions for the agent's behavior. ■ Example: You run in a loop of Thought, Action, PAUSE, Observation. At the end of the loop you output an Answer.
  - Definition of available actions. ■ Example: Your available actions are: calculate_total_price: … get_fruit_price: …
### Implementation Plan

> a. Attributes: System prompt, message history, available actions b. Methods: Handling messages, executing Actions 2. Craft prompts 3. Add tools 4. Add query handling capabilities 5. Add loops to handle complex queries (later)

### Implementing the Agent Without Loops

- **Workflow Without Loops:**
  - The agent performs a single Thought → Action → Observation flow.
- **Limitations:**
  - Cannot handle tasks that require multiple reasoning steps.

---

## 2.6 Implementing Loops for Multi-Step Agent Tasks

### Enhancing the Agent with Cycles

- **Introducing Loops for Complex Tasks:**
  - Allows the agent to perform iterative reasoning and actions.
- **Benefits:**
  - Handles multi-step queries.
  - Improves the agent's problem-solving abilities.

---

## 2.7 Understanding Nodes and Edges in LangGraph

- **Graph-Based Modelling in LangGraph**
  - LangGraph represents agent workflows as graphs.
  - Nodes and Edges depict the flow of control and data.
- **Key Components of a Graph in LangGraph**
  - State
  - Nodes
  - Edges Agent Workflows as Graphs

> 1: Shao et al. (2024) Assisting in Writing Wikipedia-like Articles From Scratch with Large Language Models 31

- **Nodes are functions that encode the logic of an agent.**
- **Receive the current state as input, perform computations, and return an updated state.**
- **Can include LLM calls or any other Python code.**
### Nodes in LangGraph

- **Nodes are added to the graph using the `add_node` method.**
- **The first argument to a node is the state.**
- **A second, optional argument is the "config" for additional parameters, ex: thread_id.**
### Implementing Nodes

```python
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph
builder = StateGraph(dict)
def my_node(state: dict, config: RunnableConfig):
return {"results": f"Hello, {state['input']}!"}
# The second argument is optional
def my_other_node(state: dict):
return state
builder.add_node("my_node", my_node)
builder.add_node("other_node", my_other_node)
```

- **START Node**
  - Entry point of the graph where user input is received.
- **END Node**
  - Terminal point of the graph indicating completion. Special Nodes
### Edges in LangGraph

- **Functions that determine which node to execute next based on the current state.**
- **Define the logic flow between nodes.**
### Types of Edges

- **Normal Edges**
  - Direct transitions from one node to the next.
- **Conditional Edges**
  - Route to different nodes based on evaluation of the state.
- **Conditional Entry Points**
  - Allow the graph to start at different nodes based on custom logic.
### Normal Edges

### Conditional Edges

```python
def routing_function(state):
return state["foo"] > 10 # return True or False based on state
graph.add_conditional_edges("node_a", routing_function, {True: "node_b", False: "node_c"})
```

### Conditional Entry Point

```python
def routing_function(state):
return state["foo"] > 10 # return True or False based on state
graph.add_conditional_edges(START, routing_function, {True: "node_b", False: "node_c"})
```

---

## 2.8 Defining and Managing State in LangGraph

- **What is State?**
  - A shared data structure representing the current snapshot of the agentic system.
  - Evolves over time as nodes perform computations and pass data.
- **Role of State**
  - Serves as the input and output schema for all nodes and edges.
  - Ensures consistency in data flow and throughout the graph. Understanding State
### Example: Understanding State

```python
from typing import TypedDict
class State(TypedDict):
foo: int
bar: list[str]
```

- **State Schema**
  - Defines the structure of the state.
  - Using TypedDict: Sketches a type-checked dictionary structure.
  - Using Pydantic BaseModel: Enriches the schema by adding validation and default values.
- **Reducers**
  - Determine how updates are applied to the state.
  - Each key in the state has its own independent reducer function State Schema and Reducers
### Default Reducer: Updates

```python
from nodes override existing
state values.
Types of Reducers
Annotated Reducer: Use
custom reducer functions like
operator.add to combine
values.
from typing import TypedDict
class State(TypedDict):
foo: int
bar: list[str]
from typing import TypedDict, Annotated
from operator import add
class State(TypedDict):
foo: int
bar: Annotated[list[str], add]
```

### Annotated Reducer Example:

- **Reducer Annotation: bar: Reducer(operator.add)**
- **Node Update: {"bar": ["bye"]}**
- **Updated State: {"foo": 1, "bar": ["hi", "bye"]}**
- **Explanation:**
  - The lists are combined using operator.add. Default Reducer Example:
- **Initial State: {"foo": 1, "bar": ["hi"]}**
- **Node Update: {"foo": 2}**
- **Updated State: {"foo": 2, "bar": ["hi"]}**
- **Explanation:**
  - The value of foo is overridden. Types of Reducers

---

## 2.9 Debugging Agent Executions with Logging

- **The Challenge: "What Went Wrong?"**
  - Agent fails to complete task → hard to diagnose
  - Non-deterministic LLM outputs
  - Multi-step workflows with hidden reasoning
  - Multiple failure points: LLM, tools, APIs, state
- **The Solution: Comprehensive Logging**
  - Track every decision point in the agent loop
  - Capture inputs, outputs, and intermediate steps
  - Transform debugging from guesswork to analysis Why Debugging is Critical
- **LLM Interactions**
  - Inputs (prompts) and outputs (responses)
  - Token usage and latency
- **Tool Activity**
  - Tool call proposals and arguments
  - Tool execution results and observations
- **Workflow State**
  - State transitions across workflow
  - Errors and exceptions What Needs to be Logged
### Sample Pseudocode for Logging

- **Why Structured Logging?**
  - JSON format for machine parsing
  - Easy integration with observability platforms
  - Searchable, filterable logs
- **Key Metadata to Include**
  - Timestamps and request IDs
  - Model name and parameters
  - Token counts and latency
  - Tool names and arguments Structured Logging for Production Agents
### Structured Logging in Code

- **What Platforms Provide**
  - Visual trace trees showing entire agent run
  - Automatic token and cost tracking
  - Comparison of runs across versions
  - Evaluation metrics and feedback loops
- **Leading Tools (2025)**
  - LangSmith, Langfuse, OpenTelemetry, Portkey, etc Logging in Observability Platforms
- **Start Logging Early**
  - Implement observability from day one
  - Easier to debug during development
  - Prevents production surprises
- **Balance Detail vs. Cost**
  - Logging full prompts/responses in production is expensive
  - Consider truncation or summarization strategies, only log the necessary parts
  - Store full traces only for failed runs Logging Best Practices
- **Log at Appropriate Levels**
  - DEBUG: Detailed diagnostics (state, intermediate values)
  - INFO: Key events (LLM calls, tool use, completions)
  - WARNING: Unexpected but handled situations
  - ERROR: Failures requiring attention Logging Best Practices
### Introduction to LangSmith

- **What is LangSmith?**
  - An all-in-one developer platform designed to support every step of the
### LLM-powered application lifecycle.

  - Facilitates debugging, collaboration, testing, and monitoring of LangGraph and LangChain applications.
- **Why Use LangSmith?**
  - Enhanced Visibility: Gain comprehensive insights into agent workflows and performance.
  - Real-Time Debugging: Identify and resolve issues promptly with detailed trace data.
  - Collaboration: Share trace data and collaborate with team members to improve agent reliability. 55

---

## 2.10 Troubleshooting Common LLM API

- **Authentication Errors (401, 403)**
- **Rate Limiting Errors (429)**
- **Service Availability Errors (500, 502, 503)**
### Overview of Common LLM API Errors

- **Missing or invalid API keys**
- **Incorrect key format (OpenAI: sk-, Anthropic: sk-ant-)**
- **Expired credentials or suspended account**
- **Wrong authorization headers**
### Authentication Errors

### Quick Validation and Detection

- **Common Types of Rate Limits when using LLMS**
  - Requests per minute (RPM)
  - Tokens per minute (TPM)
  - Tokens per day (TPD)
  - Concurrent request limits Rate Limiting Errors
### Mitigation: Exponential Backoff

### Mitigation: Using Retry Libraries

- **Implement request queuing to smooth out bursts**
- **Batch requests where the API supports it**
- **Request higher rate limits from your provider**
- **Use multiple providers as fallbacks (not to circumvent limits)**
### Prevention Strategies

- **Common Types of Availability Errors**
  - 500 Internal Server Error: API-side bug
  - 502 Bad Gateway: Proxy/load balancer issue
  - 503 Service Unavailable: Maintenance or overload
  - Scheduled maintenance windows Service Availability Errors
- **Implement circuit breakers for repeated failures**
- **Define fallback models/providers**
- **Cache responses when appropriate**
- **Subscribe to status page notifications**
### Service Availability Mitigation Strategies

### Example: Fallback Strategy

### Example: Monitor Service Status

- **Common Network Issues**
  - Connection timeouts (slow networks)
  - Read timeouts (slow API responses)
  - DNS resolution failures
  - Proxy/firewall blocking
- **Timeout Configuration**
  - Most LLM client SDKs support timeout and max_retries parameters
  - Can also implement custom timeout logic with Python's asyncio.timeout or httpx client settings Network and Timeout Errors

---

## 2.11 Building a Chatbot Agent in LangGraph

### Building a Chatbot Agent in LangGraph

- **Objective:**
  - Build a basic chatbot agent using LangGraph.
  - Enhance the chatbot with tool integration and memory capabilities.
- **Overview:**
  - Step 1: Create a basic chat agent.
  - Step 2: Integrate web search tool to extend functionality.
  - Step 3: Implement memory to maintain conversation state.
### Building a Chatbot Agent in LangGraph

---

## 2.12 Implementing Streaming Output for Real-Time Responses

- **What is Streaming?**
  - Delivering tokens as they're generated
  - Real-time display instead of waiting for completion
  - Similar to ChatGPT's typing effect
  - Most frameworks / SDKs will offer streaming option
- **Why Stream?**
  - Better user experience
  - Perceived lower latency
  - Transparency into processing
  - Ability to cancel long-running requests Understanding Streaming
### Streaming in LangChain

- **Stream Modes**
  - "values": Stream state updates
  - "messages": Stream LLM tokens
  - "updates": Stream node outputs Streaming in LangGraph
### Streaming in LangGraph

---

## 2.13 Configuring Async and Sync Agent Execution

- **Asynchronous Execution**
  - Non-blocking operations
  - Multiple tasks concurrently
  - Better for I/O-bound operations
  - Essential for high-performance applications
- **Synchronous Execution**
  - Blocking operations
  - One task at a time
  - Simple to understand and debug Sync vs Async Fundamentals
- **LLM Applications are I/O-Bound**
  - Most time spent waiting for network responses, not computing
  - CPU sits idle during API calls
- **Common I/O Operations in Agents**
  - API calls to LLM providers (often 1-30+ seconds)
  - Tool execution (web searches, database queries)
- **The Opportunity**
  - While waiting for one LLM response, initiate other requests
  - Run multiple tool calls in parallel
  - Handle multiple users simultaneously Async Execution for LLM Applications
- **Consider an I/O-bound operation taking 2 seconds per request**
- **Synchronous Execution**
  - 6 requests executed one after another
  - Total time: 6 × 2 seconds = 12 seconds
- **Asynchronous Execution**
  - 6 requests initiated simultaneously
  - Total time: ~2 seconds (time of slowest request)
  - All requests execute concurrently
- **Performance improvement scales with number of concurrent operations**
### Conceptual Example

- **Async Method Naming**
  - Sync: .invoke(), .stream()
  - Async: .ainvoke(), .astream() (prefixed with "a") Implementing Async Agents in LangGraph
- **The Challenge**
  - Can't directly call async from sync
  - Calling sync in async kills performance Mixing Sync and Async Code
### Wrapping Sync Functions

### Running Async from Sync (if needed!)

- **Use Async When**
  - Building chatbots or web services
  - Multiple concurrent users
  - High-throughput requirements
  - Many I/O operations (API calls,
### DB queries)

  - Production deployments
  - Real-time streaming needed
- **Use Sync When**
  - Simple, single-user scripts
  - Sequential workflows without I/O
  - Learning and prototyping
  - Debugging complex issues
  - CPU-bound operations When to Use Sync vs Async

---

## 2.14 Creating Reusable Dynamic Prompt Templates

- **Benefits of Templates**
  - Reusability across different use cases
  - Consistency in prompt structure
  - Easy maintenance and updates
  - Dynamic content population
  - Separation of prompt logic from code Why Prompt Templates?
- **Problems They Solve**
  - Hardcoded prompts are inflexible
  - Difficult to modify at scale
  - No way to customize for different inputs
  - Hard to version and test Why Prompt Templates?
- **Multi-user applications**
  - Same prompt structure, different user data
  - A/B testing different prompts
  - Swap templates without code changes
- **Localization and personalization**
  - Language-specific or user-specific variations
- **Domain-specific variations**
  - Tailored prompts for different industries or contexts Use Cases for Prompt Template
- **Designed for single message interaction with LLMs**
- **Uses curly braces for variables**
- **Simple string substitution**
### Prompt Templates in LangChain

### Prompt Template Example

- **Designed for multi-message interactions with LLMs**
- **Formats lists of messages**
- **Supports system, user, and assistant roles**
### Chat Prompt Templates in LangChain

### Chat Prompt Template Example

### Prompt templates change frequently during development. Without version control, you can't reproduce past results or roll back

### Treat prompts as code: version them, review changes, and track

### Tools such as Langfuse, LangSmith offer built-in prompt template

### Common Pitfall: Templates without Version Control

---

## 2.17 Implementing Input Validation and Guardrails

- **Definition**
  - Protective measures for LLM safety and reliability, applicable to inputs to
### LLMs and outputs from LLMs

- **Why do we need guardrails?**
  - Prevent unsafe or harmful outputs
  - Protect sensitive information
  - Ensure policy compliance
  - Maintain system reliability What are LLM Guardrails?
- **Types of Guardrails**
  - Input Guardrails: Validate before processing
  - Output Guardrails: Filter generated content
  - Runtime Guardrails: Monitor during execution What are LLM Guardrails?
- **Format and structure (length, encoding, data types)**
- **Content appropriateness (language, tone, topic)**
- **Injection attack attempts (malicious instructions)**
- **PII and sensitive data (emails, SSN, credentials)**
- **Query relevance (on-topic, within scope)**
### Inputs to Validate

- **Rule-Based: Pattern matching, regex, length checks**
- **Statistical: Anomaly detection, frequency analysis**
- **LLM-Based: Semantic understanding, context awareness**
- **Key Principle: Fail fast and fail safe**
  - Validate early in the pipeline
  - Provide clear error messages
  - Default to rejection when uncertain Input Validation Approaches
- **LLM-as-Judge Pattern**
  - Use separate LLM to evaluate safety
  - Semantic understanding of threats
  - Trade-off: Higher latency and cost
- **Single-Stage Guardrails**
  - One validation step before processing
  - Simple, fast, low-cost
  - Best for: Clear rules, binary decisions Guardrail Implementation Patterns
- **Multi-Stage Guardrails**
  - Sequential validation layers
  - Each layer catches different issues
  - Example: Format → Content → Security → Relevance
- **Validation as Graph Nodes**
  - Dedicated nodes for input/output validation
  - State tracks validation results and errors
  - Conditional edges route based on validation
- **Placement Strategies**
  - Entry Point: Validate before any processing
  - Pre-Agent: Check after retrieval, before reasoning
  - Pre-Tool: Validate before tool execution
  - Exit Point: Final output validation Guardrails in LangGraph
- **Layer 1: Fast rule-based checks (regex, length, format)**
- **Layer 2: Statistical analysis (anomaly detection, patterns)**
- **Layer 3: LLM-based semantic validation (context, intent)**
- **Escalate only when needed to optimize cost/latency**
### Layered Defense Strategy

- **Combine deterministic + probabilistic methods**
  - Rules handle predictable cases quickly
  - LLMs catch edge cases rules miss
- **Use rules for known threats, LLMs for novel ones**
  - Blocklists for known bad patterns
  - LLM classifiers for ambiguous content
- **Aggregate multiple signals for confidence scoring**
  - Weigh results from each validation method
  - Set thresholds for accept/reject/review Hybrid Validation Patterns
- **Pattern matching for common injection phrases**
  - Detect "ignore previous instructions", "you are now..."
  - Regex rules for known attack patterns
- **Delimiter separation (user vs system instructions)**
  - Clear boundaries between trusted and untrusted content
  - Use XML tags or special tokens as separators Prompt Injection Defense
### Prompt Injection Defense

- **LLM-based intent classification**
  - Classify input as legitimate vs adversarial
  - Detect subtle manipulation attempts
- **Input sanitization and encoding**
  - Escape special characters
  - Normalize Unicode to prevent obfuscation

---

## 2.16 Writing Test Cases for Agent Actions

- **A test case specifies: given input → expected output**
- **Why Test?**
  - Verify tools work correctly in isolation
  - Confirm agent takes the right action
  - Build confidence in your system
- **What to Test**
  - Individual tool functions (e.g., calculator, weather lookup)
  - Single agent actions (e.g., tool selection, response generation)
  - Both success cases and error handling What are Test Cases?
- **Traditional software**
  - Deterministic inputs → deterministic outputs
- **AI Agents:**
  - Same input can produce different (but correct) outputs
  - Multi-step reasoning paths may vary between runs
  - External tool calls add complexity The Challenge with Testing AI Agents
- **Deterministic testing**
  - Verify tool behavior, state management, APIs
- **Stochastic testing**
  - Evaluate LLM output quality using metrics
- **Behavioral testing**
  - Ensure agent makes correct decisions Testing Philosophy for AI Agents
- **The Three Parts (Arrange-Act-Assert)**
  - Arrange: Set up your input data
  - Act: Execute the function or agent action
  - Assert: Verify the output matches expectations Anatomy of a Simple Test Case
### Example: Testing a Tool

- **Was any tool called by the agent?**
- **Was the tool called with the right parameters?**
- **Does the final response contain expected information?**
- **Did the agent complete the task successfully?**
### Testing a Single Agent Action

- **Characteristics of Good Tests**
  - Clear: Easy to understand what's being tested
  - Focused: Tests one thing at a time
  - Independent: Doesn't rely on other tests
  - Repeatable: Same input always gives same result
- **Test Both Success and Failure**
  - Happy path: Valid input → correct output
  - Error path: Invalid input → appropriate error Writing Good Test Cases
- **Testing With Perfect Inputs Only**
  - Your test suite uses clean, well-formatted queries. Production users send typos, incomplete sentences, multiple questions in one message, and irrelevant preambles. Include messy, realistic inputs in your test suite.
- **No Regression Testing**
  - You fix a bug for Query A, but break Query B in the process. Without regression tests, you're playing whack-a-mole. Every bug fix should add a test case to prevent recurrence. Common Pitfalls

---

## 2.17 Measuring Agent Performance and Cost

- **Quantify agent effectiveness**
- **Identify performance bottlenecks**
- **Optimize costs**
- **Track improvements over time**
- **Support production monitoring Why Measure Performance?**
- **Latency: Response time**
- **Token Usage: Input/output tokens**
- **Cost: API expenses**
- **Success Rate: Task completion percentage**
- **Quality: Accuracy and correctness**
### Core Metric Categories

- **What to Measure**
  - End-to-end response time: Total time from request to final response
  - Time to first token (TTFT): Time until first output token (critical for streaming)
  - Per-node processing time: Time spent in each graph node (for workflows)
  - LLM call latency: Time taken for model inference
  - Tool execution time: Duration of external tool/API calls
- **Percentile Tracking**
  - P50 (median): Typical user experience
  - P95: Experience of 95% of users
  - P99: Worst-case scenarios Latency Metrics
- **Token Tracking**
  - Input tokens: Tokens in prompt and context
  - Output tokens: Tokens generated by model
  - Total tokens: Sum of input and output
  - Cumulative tracking across multi-turn conversations
  - Per-session and per-request granularity
- **Cost Calculation Components**
  - Input token cost: Based on prompt size
  - Output token cost: Based on generation length (typically higher rate)
  - Model-specific pricing tiers Token Usage and Cost Metrics
- **Total requests: Overall volume**
- **Successful requests: Completed without errors**
- **Failed requests: Exceptions or timeouts**
- **Success rate calculation: (successful / total) × 100**
- **Time-based analysis: Track trends over periods**
### Success Rate Tracking

- **Accuracy: Percentage of correct answers**
- **Task completion: Percentage without human escalation**
- **Error recovery rate: Percentage of errors handled gracefully**
- **Tool selection accuracy: Percentage of correct tool choices**
- **Response relevance: Quality of generated outputs**
- **Hallucination rate: Frequency of incorrect/fabricated information**
### Quality Metrics

- **Production Metrics Framework Components**
  - Centralized metrics collection
  - Multi-dimensional tracking (latency, tokens, costs, success)
  - Percentile calculations for latency analysis
  - Aggregated reporting across sessions
  - Historical data retention for trend analysis
- **Observability Frameworks such as LangSmith, Langfuse provide turnkey solutions for dashboarding and report generation**
### Metrics Dashboarding