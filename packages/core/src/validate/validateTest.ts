import { ZodError } from "zod";
import { TestCase, TestCaseSchema, ValidateTest } from "../schema/schema";

export function validateTest(test: TestCase): ValidateTest {

    let result : ValidateTest = {stat: "pass"}
    try {
        TestCaseSchema.parse(test)
    } catch (err) {
        if (err instanceof ZodError) {
            console.log(`[ERROR] ${test.name} Could not parse the test`);
            result.stat = "fail"
            result.failReason = err.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
        }
    }

    return result
}