import {TestCase, ValidatedTest} from "../schema/schema"
import {buildUrl} from "../request/buildUrl"
import {buildHeaders} from "../request/buildHeaders"
import {validateTest} from "../validate/validateTest"
import {validate} from "../validate/validateResponse"

export async function runTest(baseUrl: string, test: TestCase): Promise< ValidatedTest >  {

    try {

        validateTest(test)

        const url = buildUrl(baseUrl, test.request.url, test.request.query)
        let body: any = test.request.body ? test.request.body : undefined
        let headers = buildHeaders(test.request)
        const timeout = test.expect.timeout ?? 5000
        const hasBody = !["GET","HEAD"].includes(test.request.method)

        const start = Date.now()
        const res = await fetch(url, {
                method: test.request.method,
                headers: headers,
                body: hasBody?body:undefined,
                signal: AbortSignal.timeout(timeout)
            });
        const end = Date.now()

        const responseTime = end - start
        const resValidated =  await validate(res, test.expect, responseTime)

        // logging 
        if (resValidated.stat === "pass"){
            console.log(`[PASS] ${test.name} | ResponseTime: ${responseTime}ms`)
        } else {
            console.log(`[FAIL] ${test.name} (${resValidated.failReason})`)
        }
        
        return ({
            name: test.name,
            stat: resValidated.stat,
            failReason: resValidated.failReason
        })

    } catch (err) {
        console.log(`[ERROR] ${test.name} (${err})`)
        return ({
            name: test.name,
            stat: "fail",
            failReason: String(err)
        })
    }
}