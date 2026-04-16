
# API Testing Suite

A CLI-based API testing tool built with TypeScript in a TurboRepo monorepo.

Define API tests using YAML, execute them in parallel with configurable concurrency, and validate responses using deep matching and schema validation. Designed for performance, reliability, and clean architecture.

---

## Features

- YAML-based test definitions for simple and readable test cases  
- Parallel test execution with configurable concurrency control  
- Environment variable templating using `${VAR}` syntax  
- Deep partial response matching (nested object validation)  
- Timeout handling using AbortSignal to prevent hanging requests  
- Schema validation using Zod for strict input validation  
- Support for headers, query parameters, and request bodies  
- Deterministic result ordering even under parallel execution  
- Clean CLI output with structured test summaries  
- Modular architecture separating CLI and core engine  

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

### Example YAML

```yaml
version: 1

baseUrl: ${BASE_URL}

tests:
  - name: Get User
    request:
      method: GET
      url: /users/${USER_ID}
    expect:
      status: 200

  - name: Create User
    request:
      method: POST
      url: /users
      body:
        name: ${NAME}
    expect:
      status: 201
```

### Notes

* Variables are resolved before schema validation
* Missing variables will throw an explicit error
* Works across nested objects and arrays

---

## Example Test File

```yaml
version: 1

baseUrl: https://jsonplaceholder.typicode.com

tests:
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
* Marked as `TIMEOUT` in output

---

## Output Example

```
Running: Get User
[PASS] Get User (200) ResponseTime: 120ms

Running: Performance Check
[FAIL] Performance Check (200) (expected 50, got 120)ms

Running: Wrong Status
[FAIL] Wrong Status (expected 404, got 200)

--- Test Summary ---
Total: 3
Passed: 1
Failed: 2
```

---

## Design Principles

* Separation of concerns (CLI vs core engine)
* Composable execution pipeline (runner, concurrency, validation)
* Deterministic output under parallel execution
* Minimal dependencies with scalable architecture

---

## Roadmap

* Retry system with smart retry conditions
* Metrics (average, min, max response time)
* Array matching support
* Report generation (JSON / HTML)
* Authentication support

---

## Tech Stack

* TypeScript
* Node.js (Fetch API)
* TurboRepo
* Zod

---

## Contributing

Contributions, issues, and feature suggestions are welcome.

---

## License

MIT

