import { RequestConfig, TestCase, ValidatedTest } from "../schema/schema"
import { buildUrl } from "../request/buildUrl"
import { buildHeaders } from "../request/buildHeaders"
import { validateTest } from "../validate/validateTest"
import { validate } from "../validate/validateResponse"
import { RuntimeContext } from "../runtime/context"
import { extractVariables } from "../runtime/extractor"

export async function runTest(baseUrl: string, test: TestCase, resolvedRequest: RequestConfig, context: RuntimeContext): Promise< ValidatedTest >  {

    try {

        validateTest(test)

        const url = buildUrl(baseUrl, resolvedRequest.url, resolvedRequest.query)
        let body: any = resolvedRequest.body ? resolvedRequest.body : undefined
        let headers = buildHeaders(resolvedRequest)
        const timeout = test.expect.timeout ?? 5000
        const hasBody = !["GET","HEAD"].includes(resolvedRequest.method)

        const start = Date.now()
        const res = await fetch(url, {
                method: resolvedRequest.method,
                headers: headers,
                body: hasBody?body:undefined,
                signal: AbortSignal.timeout(timeout)
            });
        const end = Date.now()

        const responseTime = end - start
        let responseBody:any


        try{
            responseBody = await res.json()
        }catch(err){
            responseBody = null
        }


        const response = {
            status: res.status,
            body: responseBody,
        } as Response
        if (typeof test.extract !== "undefined"  && res.ok){
            extractVariables(
                test.extract,
                response.body,
                context,
                test.name
            )
        }
        
        const resValidated =  validate(response, test.expect, responseTime)
        
        return ({
            name: test.name,
            stat: resValidated.stat,
            responseTime: responseTime,
            failReason: resValidated.failReason
        })

    } catch (err: any) {
        if (err.name === "TimeoutError" || err.name === "AbortError") {
            throw { type: "TIMEOUT", message: "Request timed out" }
        }

        if (err instanceof TypeError) {
            throw { type: "NETWORK", message: err.message }
        }

        throw { type: "UNKNOWN", message: String(err) }
    }
}