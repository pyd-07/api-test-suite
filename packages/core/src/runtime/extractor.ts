import { JSONPath } from "jsonpath-plus";
import { ExtractConfig } from "../schema/schema";
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
                console.debug(`[Extract] ${testName} → ${key} = ${JSON.stringify(value)}`)
            } catch (err) {
                throw new Error(`[Extraction Error] Failed for "${key}" in "${testName}": ${err}`);
            }
        } else {
            throw new Error(`[Extraction Error] No path specified for "${key}" in ${testName}`)
        }
    }
    
}