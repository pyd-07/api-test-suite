import {TestCase, ValidatedTest} from "./schema/schema"
import {runWithConcurrency} from "./utils/concurrency"
import { runTest } from "./runner/runner"
import { runWithRetry } from "./utils/retry"
import { logger } from "./logger/wrapper"

export async function runTestSuite(baseUrl: string, tests : TestCase[], concurrency: number = 5): Promise<ValidatedTest[]> {

    const worker = (baseUrl:string, test: TestCase) => {
        return runWithRetry(
            ()=>runTest(baseUrl,test),
            test.expect.retries,
            test.expect.retryDelay
        )
    }
    const results = await runWithConcurrency(baseUrl, tests, concurrency, worker)

    const FailedTests = results.filter((result) => result.stat==="fail")
    const failCount = FailedTests.length
    
    logger.info("\n--- Test Summary ---");
    logger.start(`Total: ${results.length}`);
    logger.info(`Passed: ${results.length - failCount}`);
    logger.warn(`Failed: ${failCount}`);

    console.log("\nFailed Tests:")
    for (const test of FailedTests){
        logger.error(`- ${test.name} (${test.failReason})`)
    }

    return results
}

export * from "./report/report"
export * from "./utils/template"