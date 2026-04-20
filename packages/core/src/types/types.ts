import { TestCase } from "../schema/schema"
// --- Reports ---

export interface ReportResult {
    name: string
    status: "pass" | "fail"
    responseTime?: number
    failReason?: string
}

export interface ReportSummary {
    total: number
    passed: number
    failed: number
    duration: number
    successRate: number
}

export interface ReportMetrics {
    avgResponseTime: number
    minResponseTime: number
    maxResponseTime: number
}

export interface Report {
    timestamp: string
    summary: ReportSummary
    metrics: ReportMetrics
    results: ReportResult[]
}

// --- Run Options ---

export type RunOptions = {
    baseUrl: string,
    tests: TestCase[],
    concurrency?: number,
    env?: Record<string, string>
}

