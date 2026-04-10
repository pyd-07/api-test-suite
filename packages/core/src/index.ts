import {TestCase} from "@repo/core/types/test"
import {buildUrl} from "@repo/core/request/buildUrl"
import {buildHeaders} from "@repo/core/request/buildHeaders"

export async function runTestSuite(baseUrl: string, tests : TestCase[]) {
    let passCount = 0, failCount = 0, delayedCount = 0
    let failedTests: TestCase[] =[]

    for (const test of tests) {
        console.log(`\nRunning: ${test.name}`);

        const url = buildUrl(baseUrl, test.request.url, test.request.query)
        let body: any = test.request.body ? test.request.body : undefined
        let headers = buildHeaders(test.request)

        try {
            const start = Date.now()
            const res = await fetch(url, {
                method: test.request.method,
                headers: headers,
                body: ["GET","HEAD"].includes(test.request.method)?undefined:body
            });
            const end = Date.now()

            const expected = test.expect.status;
            const actual = res.status;
            const responseTime = end - start

            if (actual === expected) {
                if (test.expect.responseTime){
                    if(test.expect.responseTime >= responseTime){
                        console.log(`[PASS] ${test.name} (${actual}) ResponseTime: ${responseTime}ms`)
                        passCount++;
                    } else {
                        console.log(`[DELAY] ${test.name} (${actual}) ResponseTime: (expected ${test.expect.responseTime}, got ${responseTime})ms`)
                        delayedCount++
                    }
                } else {
                    console.log(`[PASS] ${test.name} (${actual}) ResponseTime: ${responseTime}ms`)
                    passCount++;
                }
            } else {
                console.log(`[FAIL] ${test.name} (expected ${expected}, got ${actual})`);
                failCount++;
                failedTests.push(test);
            }

        } catch (err) {
        console.log(`ERROR ${test.name} (${err})`);
        failCount++;
        failedTests.push(test);
        }
    }



    console.log("\n--- Test Summary ---");
    console.log(`Total: ${passCount + failCount + delayedCount}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Delayed: ${delayedCount}`);
    console.log(`Failed: ${failCount}`);

    if (failedTests.length > 0) {
        console.log("\nFailed Tests:");
        for (const test of failedTests) {
            console.log(`- ${test.name}`);
        }
    }
}
