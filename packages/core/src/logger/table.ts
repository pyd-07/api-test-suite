import Table from "cli-table3"
import chalk from "chalk"
import { ValidatedTest } from "../schema/schema.js"

/**
 * Renders a structured summary table after all tests complete.
 * 
 * Columns: Test Name | Status | Response Time | Error
 * - Respects input order (array order = deterministic)
 * - Truncates error messages to prevent table breakage
 * - Uses chalk for colored status indicators
 */

const MAX_ERROR_LENGTH = 50

function truncate(str: string, max: number): string {
    if (str.length <= max) return str
    return str.slice(0, max - 1) + "…"
}

function formatStatus(stat: "pass" | "fail"): string {
    return stat === "pass"
        ? chalk.green("PASS")
        : chalk.red("FAIL")
}

function formatTime(ms: number | undefined): string {
    if (ms === undefined) return chalk.dim("—")
    return `${ms}ms`
}

function formatError(reason: string | undefined): string {
    if (!reason) return chalk.dim("—")
    return chalk.redBright(truncate(reason, MAX_ERROR_LENGTH))
}

export function renderSummaryTable(results: ValidatedTest[]): void {
    const table = new Table({
        head: [
            chalk.bold("Test Name"),
            chalk.bold("Status"),
            chalk.bold("Time"),
            chalk.bold("Error"),
        ],
        colWidths: [40, 10, 10, 55],
        style: {
            head: [],      // disable default colors on headers (we use chalk)
            border: [],    // disable default border colors
        },
        wordWrap: true,
    })

    for (const result of results) {
        table.push([
            result.name,
            formatStatus(result.stat),
            formatTime(result.responseTime),
            formatError(result.failReason),
        ])
    }

    console.log(table.toString())
}
