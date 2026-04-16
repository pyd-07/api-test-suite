import {TestCase} from "./schema/schema"
import {runWithConcurrency} from "./utils/concurrency"
import { runTest } from "./runner/runner"
import { runWithRetry } from "./utils/retry"

export async function runTestSuite(baseUrl: string, tests : TestCase[], concurrency: number = 5) {

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
    
    console.log("\n--- Test Summary ---");
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${results.length - failCount}`);
    console.log(`Failed: ${failCount}`);

    console.log("\nFailed Tests:")
    for (const test of FailedTests){
        console.log(`- ${test.name} (${test.failReason})`)
    }

}

export * from "./utils/template"