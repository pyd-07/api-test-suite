import { TestCase, ValidatedTest } from "./schema/schema"
import { RuntimeContext } from "./runtime/context"
import { resolveObject, resolveString } from "./runtime/resolver"
import { runWithConcurrency } from "./utils/concurrency"
import { runTest } from "./runner/runner"
import { runWithRetry } from "./utils/retry"
import { log } from "./logger/logger"
import { logger } from "./logger/wrapper"
import { createSpinner } from "./logger/spinner"
import { renderSummaryTable } from "./logger/table"
import chalk from "chalk"

export async function runTestSuite(baseUrl: string, tests : TestCase[], concurrency: number = 5, env: Record<string, string>): Promise<ValidatedTest[]> {
    try{
        const context = new RuntimeContext()
        const resolvedBaseUrl = resolveString(baseUrl, context, env)

        const worker = (resolvedBaseUrl:string, test: TestCase) => {
            const resolvedRequest = resolveObject(test.request, context, env)
            return runWithRetry(
                ()=>runTest(
                    resolvedBaseUrl,
                    test,
                    resolvedRequest,
                    context
                ),
                test.retries,
                test.retryDelay
            )
        }

        // --- Phase 1: Header ---
        console.log()
        logger.info(`  Running ${chalk.bold(String(tests.length))} tests with ${chalk.bold(String(concurrency))} worker/s`)
        console.log()

        // --- Phase 2: Execute with spinner ---
        const spinner = createSpinner("Executing tests…")
        spinner.start()

        const results = await runWithConcurrency(resolvedBaseUrl, tests, concurrency, worker)

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
    } catch (err) {
        logger.divider()
        logger.error(String(err))
        process.exit(1)
    }
}

export * from "./report/report"