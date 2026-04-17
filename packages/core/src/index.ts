import {TestCase, ValidatedTest} from "./schema/schema"
import {runWithConcurrency} from "./utils/concurrency"
import { runTest } from "./runner/runner"
import { runWithRetry } from "./utils/retry"
import { log } from "./logger/logger"
import { logger } from "./logger/wrapper"
import { createSpinner } from "./logger/spinner"
import { renderSummaryTable } from "./logger/table"
import chalk from "chalk"

export async function runTestSuite(baseUrl: string, tests : TestCase[], concurrency: number = 5): Promise<ValidatedTest[]> {

    const worker = (baseUrl:string, test: TestCase) => {
        return runWithRetry(
            ()=>runTest(baseUrl,test),
            test.expect.retries,
            test.expect.retryDelay
        )
    }

    // --- Phase 1: Header ---
    console.log()
    logger.info(`  Running ${chalk.bold(String(tests.length))} tests with ${chalk.bold(String(concurrency))} worker/s`)
    console.log()

    // --- Phase 2: Execute with spinner ---
    const spinner = createSpinner("Executing tests…")
    spinner.start()

    const results = await runWithConcurrency(baseUrl, tests, concurrency, worker)

    const failCount = results.filter((result) => result.stat==="fail").length

    // --- Phase 3: Stop spinner ---
    if (failCount > 0) {
        spinner.fail(chalk.red(`Execution complete — ${failCount} test${failCount > 1 ? "s" : ""} failed`))
    } else {
        spinner.succeed(chalk.green("All tests passed"))
    }

    // --- Phase 4: Per-test results (deterministic order) ---
    console.log()
    logger.divider()
    console.log(chalk.bold("  Test Results"))
    logger.divider()
    console.log()

    for (const result of results) {
        log(result)
    }

    // --- Phase 5: Summary table ---
    console.log()
    renderSummaryTable(results)

    // --- Phase 6: Final counts ---
    console.log()
    console.log(`  ${chalk.bold("Total:")} ${results.length}   ${chalk.green("Passed:")} ${results.length - failCount}   ${chalk.red("Failed:")} ${failCount}`)
    console.log()

    return results
}

export * from "./report/report"
export * from "./utils/template"