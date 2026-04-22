import { TestCase, ValidatedTest } from "./schema/schema"
import { RuntimeContext } from "./runtime/context"
import { resolveObject, resolveString } from "./runtime/resolver"
import { shouldRunSequentially } from "./runtime/extractor"
import { runWithConcurrency } from "./utils/concurrency"
import { runTest } from "./runner/runner"
import { runWithRetry } from "./utils/retry"
import { logger } from "./logger/wrapper"
import { createSpinner } from "./logger/spinner"
import { renderSummaryTable } from "./logger/table"
import chalk from "chalk"

export async function runTestSuite(baseUrl: string, tests : TestCase[], concurrency: number = 5, env: Record<string, string>): Promise<ValidatedTest[]> {
    try{
        const context = new RuntimeContext()
        const resolvedBaseUrl = resolveString(baseUrl, context, env)

        // Determine if sequential execution is required
        const runSequentially = shouldRunSequentially(tests)
        const effectiveConcurrency = runSequentially ? 1 : concurrency

        // Phase 1: Header
        console.log()
        if (runSequentially) {
            logger.warn(`Running ${tests.length} tests sequentially (dependency detected)`)
        } else {
            logger.info(`Running ${tests.length} tests with ${effectiveConcurrency} workers (parallel)`)
        }
        console.log()

        // Phase 2: Execute with spinner
        let done = 0
        const total = tests.length
        const spinner = createSpinner(`Executing tests... (0/${total})`)
        spinner.start()

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
                test.retryDelay,
                (attempt, maxRetries) => {
                    spinner.clear()
                    logger.retry(test.name, attempt, maxRetries)
                    spinner.render()
                }
            )
        }

        const results = await runWithConcurrency(
            resolvedBaseUrl, 
            tests, 
            effectiveConcurrency, 
            worker,
            (result) => {
                spinner.clear()
                if (result.stat === "pass") {
                    logger.pass(result.name, result.responseTime)
                } else {
                    logger.fail(result.name, result.failReason)
                }
                done++
                spinner.text = `Executing tests... (${done}/${total})`
                spinner.render()
            }
        )

        const failCount = results.filter((result) => result.stat==="fail").length

        // Phase 3: Stop spinner
        if (failCount > 0) {
            spinner.fail(chalk.red(`Execution complete — ${failCount} test${failCount > 1 ? "s" : ""} failed`))
        } else {
            spinner.succeed(chalk.green("All tests passed"))
        }

        // Phase 4 & 5: Summary table
        console.log()
        renderSummaryTable(results)

        // Phase 6: Final counts
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