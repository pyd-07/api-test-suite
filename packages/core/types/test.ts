export type HTTPMethod = 
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "HEADS"

export interface RequestConfig {
    method: HTTPMethod
    url: string

    headers?: Record<string, string>
    query?: Record<string, string | number>

    body?: unknown
    timeout?: number 
}

export interface Expectation {
    status: number

    headers?: Record<string, string>
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
