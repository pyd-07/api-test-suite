import {Expectation, ValidateTest} from "../schema/schema"
import {deepMatch} from "../utils/deepMatch"

export async function validate(response: Awaited< ReturnType<typeof fetch> >, expect: Expectation, responseTime: number) : Promise<ValidateTest> {
    const actualStatus = response.status
    const expectedStatus = expect.status

    const resText = await response.text()

    let validation: ValidateTest ={ isPass: true }


    // status check 
    if (actualStatus !== expectedStatus){
        validation.isPass = false
        validation.failReason = `expected ${expectedStatus}, got ${actualStatus}`
    }
    // body validation
    if ( validation.isPass && expect.body?.contains ){
        if (!resText.toLowerCase().includes(expect.body.contains.toLowerCase())){
            validation.isPass = false
            validation.failReason = `body does not contain ${expect.body.contains}`
        }
    }
    if (validation.isPass && expect.body?.equals){
        try {
            const parsed = JSON.parse(resText)
            if (!deepMatch(parsed, expect.body.equals)){
                validation.isPass = false
                validation.failReason = `body does not match expected`
            }
        } catch {
            validation.isPass = false
            validation.failReason = `failed to parse the response`
        }
    }

    // response time validation
    if (validation.isPass) {
        if(expect.responseTime && expect.responseTime < responseTime){
           validation.isPass = false
           validation.failReason = `delayed response (expected ${expect.responseTime}ms, got ${responseTime}ms)`
        }
    }
    
    return validation
}