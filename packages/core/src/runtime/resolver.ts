import { RuntimeContext } from "./context";

const VARIABLE_REGEX = /\$\{(\w+)\}/g

export function resolveString (
    input: string,
    context: RuntimeContext,
    env: Record<string, string>
):string {
    return input.replace(VARIABLE_REGEX, (_, key:string) => {
        if (context.has(key)) {
            return String(context.get(key))
        }
        if (env[key] !== undefined) {
            return env[key]
        }
        throw new Error(
            `[Resolve Error] Variable ${key} not found in context or enivronment`
        )
        
    })
}

export function resolveObject(
    obj:any,
    context: RuntimeContext,
    env: Record<string, string>
):any {
    if (typeof obj === "string"){
        return resolveString(obj, context, env)
    }
    if (Array.isArray(obj)){
        return obj.map((item) => resolveObject(item, context, env))
    }
    if (typeof obj === "object") {
        const resolved: Record<string, any> = {}
        for (const key in obj) {
            resolved[key] = resolveObject(obj[key], context, env)
        }
        return resolved
    }
    return obj
}