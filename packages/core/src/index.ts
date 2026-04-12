import {TestCase, FailedTest, TestCaseSchema} from "./schema/schema"
import {buildUrl} from "./request/buildUrl"
import {buildHeaders} from "./request/buildHeaders"
import {validate} from "./validate/validateResponse"
import { ZodError } from "zod"

export async function runTestSuite(baseUrl: string, tests : TestCase[]) {
    let passCount = 0, failCount = 0
    let failedTests: FailedTest[] = []

    for (const test of tests) {

        console.log(`\nRunning: ${test.name}`);

        try {
            TestCaseSchema.parse(test)
        } catch (err){
            if(err instanceof ZodError){
                console.log(`[ERROR] ${test.name} Could not parse the test`);
                failCount++
                failedTests.push({
                    name: test.name,
                    reason: err.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
                });
            }
            continue
        }

        const url = buildUrl(baseUrl, test.request.url, test.request.query)
        let body: any = test.request.body ? test.request.body : undefined
        let headers = buildHeaders(test.request)

        try {
            const start = Date.now()
            const res = await fetch(url, {
                method: test.request.method,
                headers: headers,
                body: ["GET","HEAD"].includes(test.request.method)?undefined:body,
                signal: test.request.timeout ? AbortSignal.timeout(test.request.timeout) : AbortSignal.timeout(5000)
            });
            const end = Date.now()

            const responseTime = end - start
            const resValidated = await validate(res, test.expect, responseTime)

            if (resValidated.isPass) {
                console.log(`[PASS] ${test.name} | ResponseTime: ${responseTime}ms`)
                passCount++
            } else {
                console.log(`[FAIL] ${test.name} (${resValidated.failReason})`);
                failCount++;
                failedTests.push({
                    name: test.name,
                    reason: resValidated.failReason
                });
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
