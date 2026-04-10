import {TestCase, FailedTest} from "@repo/core/types/test"
import {buildUrl} from "./request/buildUrl"
import {buildHeaders} from "./request/buildHeaders"

export async function runTestSuite(baseUrl: string, tests : TestCase[]) {
    let passCount = 0, failCount = 0, delayedCount = 0
    let failedTests: FailedTest[] = []

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

            const expected = test.expect.status
            const actual = res.status
            const responseTime = end - start
            const text = await res.text()

            let isPass = true
            let failReason = ""

            // status check
            if(actual !== expected){
                isPass = false
                failReason = `expected ${expected}, got ${actual}`
            }

            // body validation
            if(isPass && test.expect.body?.contains){                                   // partial match [contains]
                if(!text.includes(test.expect.body.contains)){
                    isPass = false
                    failReason = `body does not contain ${test.expect.body.contains}`
                }
            }
            if(isPass && test.expect.body?.equals){                                     // exact match []
                try{
                    const parsed = JSON.parse(text)
                    if(JSON.stringify(parsed) !== JSON.stringify(test.expect.body.equals)){
                        isPass = false
                        failReason = `body does not match expected`
                    }
                } catch {
                    isPass = false
                    failReason = `failed to parse the reponse`
                }
            }

            if (isPass) {
                if(test.expect.responseTime){
                    if(responseTime <= test.expect.responseTime){
                        console.log(`[PASS] ${test.name} (${actual}) ResponseTime: ${responseTime}ms`)
                        passCount++;
                    } else {
                        console.log(`[DELAY] ${test.name} (${actual}) ResponseTime: (expected ${test.expect.responseTime}, got ${responseTime})ms`)
                        delayedCount++
                    }
                } else  {
                    console.log(`[PASS] ${test.name} (${actual}) ResponseTime: ${responseTime}ms`)
                    passCount++;
                }
            } else {
                console.log(`[FAIL] ${test.name}`);
                failCount++;
                failedTests.push({
                    name: test.name,
                    reason: failReason
                });
            }


        } catch (err) {
            console.log(`ERROR ${test.name} (${err})`);
            failCount++;
            failedTests.push({
                name: test.name,
                reason: String(err)
            });
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
            console.log(`- ${test.name} ( ${test.reason} )`);
        }
    }
}
