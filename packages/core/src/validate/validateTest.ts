import { ZodError } from "zod";
import { TestCase, TestCaseSchema } from "../schema/schema";

export function validateTest(test: TestCase) {

    try {
        TestCaseSchema.parse(test)
    } catch (err) {
        if (err instanceof ZodError) {
            throw new Error(err.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", "))
        }
        throw err
    }
}