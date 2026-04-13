import {TestCase, FailedTest, TestCaseSchema} from "./schema/schema"
import {validateTest} from "./validate/validateTest"
import {runTest} from "./runner/runner"

export async function runTestSuite(baseUrl: string, tests : TestCase[]) {
    let passCount = 0, failCount = 0
    let failedTests: FailedTest[] = []

    for (const test of tests) {

        console.log(`\nRunning: ${test.name}`);

        try {
            const testValidated = validateTest(test)
            if (!(testValidated.stat === "pass")){
              failCount++
              failedTests.push({name: test.name, reason: testValidated.failReason})  
            } else {       
                const resValidated = await runTest(baseUrl, test)
                if (resValidated.stat === "pass"){
                    passCount ++
                } else {
                    failCount++
                    failedTests.push({name: test.name, reason: resValidated.failReason})
                }
            }
        } catch (err) {
            console.log(`[ERROR] ${test.name} (${err})`);
            failCount++;
            failedTests.push({
                name: test.name,
                reason: String(err)
            });
        }
    }



    console.log("\n--- Test Summary ---");
    console.log(`Total: ${passCount + failCount}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);

    if (failedTests.length > 0) {
        console.log("\nFailed Tests:");
        for (const test of failedTests) {
            console.log(`- ${test.name} ( ${test.reason} )`);
        }
    }
}
