import { JSONPath } from "jsonpath-plus";
import { ExtractConfig, RequestConfig, TestCase } from "../schema/schema";
import { RuntimeContext } from "./context";

export function extractVariables(
    extractConfig: ExtractConfig,
    responseBody: Response["body"],
    context: RuntimeContext,
    testName: string
) {
    for (const key in extractConfig) {
        const path = extractConfig[key]
        if(path){
            try {
                const result = JSONPath({
                    path,
                    json: responseBody
                })
                if (!result || result.length === 0) {
                    throw new Error(`[Extraction Error] "${key}" not found using path "${path}"`)
                }
                const value = result[0]
                context.set(key, value)
            } catch (err) {
                throw new Error(`[Extraction Error] Failed for "${key}" in "${testName}": ${err}`);
            }
        } else {
            throw new Error(`[Extraction Error] No path specified for "${key}" in ${testName}`)
        }
    }
    
}

function getExtractedVars(tests: TestCase[]): string[] {
    const vars: string[] = []
    for (const test of tests) {
        if (test.extract) {
            Object.keys(test.extract).forEach(key => vars.push(key))
        }
    }
    return vars
}

function usesExtractedVars(
    request: RequestConfig,
    extractedVars: string[]
): boolean {
    const str = JSON.stringify(request)
    for (const v of extractedVars) {
        if (str.includes(`\${${v}}`)) return true
    }
    return false
}

export function shouldRunSequentially(
    tests: TestCase[],
): boolean {
    const extractedVars = getExtractedVars(tests)
    
    return tests.some(test => usesExtractedVars(test.request, extractedVars))
}