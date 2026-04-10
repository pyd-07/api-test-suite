import {TestCase} from "@repo/core/types/test"

export async function runTestSuite(baseUrl: string, tests : TestCase[]) {
    let passCount = 0, failCount = 0
    let failedTests: TestCase[] =[]

    for (const test of tests) {
        console.log(`\nRunning: ${test.name}`);

        try {
            const start = Date.now()
            const res = await fetch(baseUrl+test.request.url, {
                method: test.request.method ,
                headers: test.request.headers ? test.request.headers : {},
            });
            const end = Date.now()

            const expected = test.expect.status;
            const actual = res.status;
            const responseTime = end - start

            if (actual === expected) {
                if (test.expect.responseTime){
                    if(test.expect.responseTime >= responseTime){
                        console.log(`[PASS] ${test.name} (${actual}) ResponseTime: ${responseTime}ms`);
                    } else {
                        console.log(`[DELAY] ${test.name} (${actual}) ResponseTime: (expected ${test.expect.responseTime}, got ${responseTime})ms`);
                    }
                } else {
                    console.log(`[PASS] ${test.name} (${actual}) ResponseTime: ${responseTime}ms`)
                }
                passCount++;
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
    console.log(`Total: ${passCount + failCount}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);

    if (failedTests.length > 0) {
        console.log("\nFailed Tests:");
        for (const test of failedTests) {
            console.log(`- ${test.name} : ${test.description}`);
        }
    }
}