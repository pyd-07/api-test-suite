import {Expectation, ValidatedResponse} from "../schema/schema"
import {deepMatch} from "../utils/deepMatch"

export function validate(response: any, expect: Expectation, responseTime: number) : ValidatedResponse {
    const actualStatus = response.status
    const expectedStatus = expect.status

    const body = response.body;

    const resText =
        typeof body === "string"
            ? body
            : JSON.stringify(body);

    let validation: ValidatedResponse ={ stat: "pass" }

    // status check 
    if (actualStatus !== expectedStatus){
        validation.stat = "fail"
        validation.failReason = `expected ${expectedStatus}, got ${actualStatus}`
    }

    // body validation
    if ( validation.stat === "pass" && expect.body?.contains ){
        if (!resText.toLowerCase().includes(expect.body.contains.toLowerCase())){
            validation.stat = "fail"
            validation.failReason = `body does not contain ${expect.body.contains}`
        }
    }
    if (validation.stat === "pass" && expect.body?.equals){
        try {
            const parsed = JSON.parse(resText)
            if (!deepMatch(parsed, expect.body.equals)){
                validation.stat = "fail"
                validation.failReason = `body does not match expected`
            }
        } catch {
            validation.stat = "fail"
            validation.failReason = `failed to parse the response`
        }
    }

    // response time validation
    if (validation.stat === "pass" ) {
        if(expect.responseTime && expect.responseTime < responseTime){
           validation.stat = "fail"
           validation.failReason = `delayed response (expected ${expect.responseTime}ms, got ${responseTime}ms)`
        }
    }
    
    return validation
}