import {TestCase, RequestConfig, Headers, queryParams} from "@repo/core/types/test"

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
                body: body
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

function buildUrl(baseUrl:string, requestUrl:string, query?: queryParams){
    const url = new URL(requestUrl, baseUrl)
    if(query){
        for (const [key, value] of Object.entries(query)){
            url.searchParams.append(key, String(value))
        }
    }
    return url
}

function buildHeaders(request: RequestConfig){
    let headers: Headers = request.headers || {}

    // This is helper block added , because the fetch with header 'Content-Type' kept returning status code 500
    // but the request with header 'content-type' successfully fulfilled the request
    // hence I'll keep this helper block
    if (request.body && !headers['content-type']){
        headers['content-type'] = 'application/json'
    }

    return headers
}