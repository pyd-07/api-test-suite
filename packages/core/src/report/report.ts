import fs from "fs"
import path from "path"
import { ValidatedTest } from "../schema/schema"

// --- Types ---

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

// --- Generator ---

export function generateReport(results: ValidatedTest[], durationMs: number): Report {
    const total = results.length
    const passed = results.filter(r => r.stat === "pass").length
    const failed = total - passed

    const responseTimes = results
        .map(r => r.responseTime)
        .filter((t): t is number => t !== undefined && t !== null)

    const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length)
        : 0

    const minResponseTime = responseTimes.length > 0
        ? Math.min(...responseTimes)
        : 0

    const maxResponseTime = responseTimes.length > 0
        ? Math.max(...responseTimes)
        : 0

    const reportResults: ReportResult[] = results.map(r => {
        const entry: ReportResult = {
            name: r.name,
            status: r.stat,
        }
        if (r.responseTime !== undefined) {
            entry.responseTime = r.responseTime
        }
        if (r.failReason) {
            entry.failReason = r.failReason
        }
        return entry
    })

    return {
        timestamp: new Date().toISOString(),
        summary: {
            total,
            passed,
            failed,
            duration: durationMs,
            successRate: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
        },
        metrics: {
            avgResponseTime,
            minResponseTime,
            maxResponseTime,
        },
        results: reportResults,
    }
}

// --- File Writer ---

export function writeReportFile(report: Report, filePath: string): void {
    const resolved = path.resolve(filePath)
    const dir = path.dirname(resolved)

    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(resolved, JSON.stringify(report, null, 2), "utf-8")
}
