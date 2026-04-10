export type HTTPMethod = 
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "HEADS"

export type Headers = Record<string, string> 
export type queryParams = Record<string, string | number>
export interface RequestConfig {
    method: HTTPMethod
    url: string

    headers?: Headers
    query?: queryParams

    body?: unknown
    timeout?: number 
}

export interface Expectation {
    status: number

    headers?: Headers
    body?: {
        contains?: string
        equals?: unknown
    }

    responseTime?: number

}

export interface TestCase {
    name: string
    description?: string
    request: RequestConfig
    expect: Expectation
}

export interface FailedTest {
    name: string
    reason: string
}