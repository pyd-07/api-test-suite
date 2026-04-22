
# API Testing Suite

A CLI-based API testing tool built with TypeScript in a TurboRepo monorepo.

Define API tests using YAML, execute them in parallel with configurable concurrency, and validate responses using deep matching and schema validation. Designed for performance, reliability, and clean architecture.

---

## Features

- YAML-based test definitions for simple and readable test cases  
- Parallel test execution with configurable concurrency control  
- Retry mechanism for transient failures (network/timeouts)  
- Environment variable templating using `${VAR}` syntax  
- Deep partial response matching (nested object validation)  
- Timeout handling using AbortSignal to prevent hanging requests  
- Schema validation using Zod for strict input validation  
- Support for headers, query parameters, and request bodies  
- Deterministic result ordering even under parallel execution  
- Structured CLI logging with categorized output (pass/fail/info/warn) and timestamps
- JSON report generation with summary, metrics, and per-test results 
- Variable extraction from API responses using JSONPath  
- Runtime context for sharing data between tests  
- Dynamic request construction using `${variable}` syntax with runtime resolution  
- Support for chaining dependent tests via extracted values  
- Priority-based variable resolution (context > environment)   
- Modular architecture separating CLI and core engine  

## Execution Model

The engine follows a deterministic execution pipeline:

1. Resolve variables (context + environment)  
2. Execute request  
3. Validate response  
4. Extract variables (if defined)  
5. Update runtime context  

This ensures predictable behavior even in complex chained test scenarios.

---

## Architecture

```

apps/
└── cli/        # CLI interface

packages/
└── core/       # Test engine (execution, validation, concurrency)

````

---

## Installation

```bash
git clone https://github.com/pyd-07/api-test-suite.git
cd api-testing-suite
npm install
npm run build
````

(Optional: link CLI globally)

```bash
npm link
```

---

## Usage

```bash
suite run test.yml
```

With concurrency control:

```bash
suite run test.yml --concurrency 5
```

---

## Environment Variables

You can use environment variables inside your YAML using `${VAR}` syntax.

### Example `.env`

```env
BASE_URL=https://jsonplaceholder.typicode.com
USER_ID=1
NAME=Piyush
```
---
## Test Chaining & Variable Extraction

You can extract values from one test’s response and reuse them in subsequent tests.

Example
```yaml

tests:
  - name: Create User
    request:
      method: POST
      url: /users
      body:
        name: "John"
    expect:
      status: 201
    extract:
      userId: $.id

  - name: Get Created User
    request:
      method: GET
      url: /users/${userId}
    expect:
      status: 200
  ```

### How it works

- extract uses JSONPath to select values from the response body
- extracted values are stored in a runtime context
- ${variable} syntax resolves values dynamically in subsequent tests

### Variable Resolution Priority

Variables are resolved in the following order:

- Runtime context (extracted variables)
- Environment variables (.env)

This allows extracted values to override static configuration when needed.

### Execution Behavior

The test runner automatically detects dependencies between tests.

- If no dependencies are found → tests run in parallel  
- If extracted variables are used in subsequent tests → execution falls back to sequential mode  

This ensures both performance and correctness without manual configuration.

### Notes

- Extraction runs only after a test passes
- Missing variables will throw explicit errors
- Supports nested JSON paths (e.g., $.data.id)
- Works across headers, query params, and request body

> ⚠️ Note: Tests using extracted variables may trigger automatic sequential execution to ensure deterministic results.


---

## Example Test File

```yaml
version: 1

baseUrl: https://jsonplaceholder.typicode.com

tests:
  # -------------------------
  # BASIC VALIDATION
  # -------------------------
  - name: Get User
    request:
      method: GET
      url: /users/1
    expect:
      status: 200
      responseTime: 500
      body:
        equals:
          id: 1
          name: "Leanne Graham"

  # -------------------------
  # STRING MATCHING
  # -------------------------
  - name: User Name Contains
    request:
      method: GET
      url: /users/1
    expect:
      status: 200
      body:
        contains: "Leanne"

  # -------------------------
  # QUERY + HEADERS
  # -------------------------
  - name: Get Comments by Post
    request:
      method: GET
      url: /comments
      query:
        postId: 1
      headers:
        Accept: application/json
    expect:
      status: 200

  # -------------------------
  # EXTRACTION + CHAINING
  # -------------------------
  - name: Extract User ID
    request:
      method: GET
      url: /users/1
    expect:
      status: 200
    extract:
      userId: $.id
      userName: $.name

  - name: Use Extracted User ID
    request:
      method: GET
      url: /users/${userId}
    expect:
      status: 200
      body:
        equals:
          id: 1

  # -------------------------
  # ARRAY EXTRACTION
  # -------------------------
  - name: Extract First User From List
    request:
      method: GET
      url: /users
    expect:
      status: 200
    extract:
      firstUserId: $[0].id

  - name: Use First User From Array
    request:
      method: GET
      url: /users/${firstUserId}
    expect:
      status: 200

  # -------------------------
  # ENV + CONTEXT VARIABLES
  # -------------------------
  - name: Create User (Env Variable)
    request:
      method: POST
      url: /users
      body:
        name: ${NAME}
    expect:
      status: 201
```

---

## Assertions

### Status Code

```yaml
expect:
  status: 200
```

---

### Response Time

```yaml
expect:
  responseTime: 500
```

---

### Deep Partial Matching

```yaml
expect:
  body:
    equals:
      id: 1
      address:
        city: "Gwenborough"
```

Matches nested fields and ignores extra fields in the response.

---

### Contains (string match)

```yaml
expect:
  body:
    contains: "Leanne"
```

---

## Request Configuration

```yaml
request:
  method: POST
  url: /users
  headers:
    Content-Type: application/json
  query:
    userId: 1
  body:
    name: "Piyush"
```

---

## Timeout Handling

```yaml
expect:
  timeout: 2000
```

* Aborts the request if it exceeds the defined limit
* Timeout errors are treated as retryable failures (if retries are configured)

---

## Retry Mechanism

Tests can be configured to retry automatically on transient failures such as network errors or timeouts.

```yaml
tests:
  - name: Retry Example
    request:
      method: GET
      url: /users/1
    retryDelay: 200
    retries: 2
    expect:
      status: 200
```

* `retries`: Maximum number of retry attempts (default: 2)
* `retryDelay`: Delay between retries in milliseconds (default: 200)
* Retries only on network errors and timeouts
* Final result shows total attempts and time

---

## Logging

The CLI uses structured and categorized logging for clear output.

### Log Types

- `✔ PASS` → Test succeeded  
- `ERROR [FAIL]` → Test failed with reason  
- `WARN` → Summary warnings  
- `ℹ` → Informational logs (setup, environment, workers)  

### Features

- Timestamped logs for each test execution  
- Worker/concurrency visibility  
- Environment injection visibility  
- Failure grouping at the end of execution  

Logging is handled at the orchestration layer to prevent duplicate logs during retries.


## CLI Output Preview

![CLI Output](./assets/cli-output.png)
---

## Design Principles

* Separation of concerns (CLI vs core engine)
* Composable execution pipeline (runner, concurrency, validation)
* Deterministic output under parallel execution
* Stateful test execution with controlled data flow between tests
* Minimal dependencies with scalable architecture

---

## Roadmap

* Dependency-aware execution (automatic sequential mode for chained tests)
* Authentication support

---

## Tech Stack

* TypeScript
* Node.js (Fetch API)
* TurboRepo
* Zod

---

## Development Notes

This project was built with the assistance of AI tools to accelerate development and experimentation.

AI was primarily used for:
- Generating initial implementations for isolated components
- Exploring alternative approaches to logging, concurrency, and validation
- Speeding up iteration during feature development

All architectural decisions, system design, and final integrations were implemented and reviewed manually to ensure correctness, maintainability, and consistency across the codebase.

The goal of this project is not just functionality, but to demonstrate strong understanding of:
- System design (execution pipeline, retries, concurrency)
- Clean architecture (separation of CLI and core engine)
- Developer tooling and usability

---

## Contributing

Contributions, issues, and feature suggestions are welcome.

---

## License

MIT

