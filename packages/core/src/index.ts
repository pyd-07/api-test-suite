import {TestCase} from "./schema/schema"
import {runWithConcurrency} from "./utils/concurrency"
import { runTest } from "./runner/runner"

export async function runTestSuite(baseUrl: string, tests : TestCase[]) {
    const results = await runWithConcurrency(baseUrl, tests, 10, runTest)

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
