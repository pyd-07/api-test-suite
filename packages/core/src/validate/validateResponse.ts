import {Expectation, ValidateTest} from "../schema/schema"
import {deepMatch} from "../utils/deepMatch"

export async function validate(response: Awaited< ReturnType<typeof fetch> >, expect: Expectation, responseTime: number) : Promise<ValidateTest> {
    const actualStatus = response.status
    const expectedStatus = expect.status

    const resText = await response.text()

    let validation: ValidateTest ={ stat: "pass" }

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