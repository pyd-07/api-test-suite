export function resolveObject(obj: any): any{
    if (typeof obj === "string"){
        return resolveTemplate(obj)
    }
    if (Array.isArray(obj)){
        return obj.map((item) => resolveObject(item))
    }
    if (typeof obj === "object" && obj !== null){
        const result:any = {};
        for (const key in obj) {
            result[key] = resolveObject(obj[key])
        }
        return result
    }
    return obj
}

export function resolveTemplate(value: string){
    return value.replace(/\$\{(\w+)\}/g, (_, key) => {
        const envVal = process.env[key]
        if (envVal === undefined){
            throw new Error(`Missing environment variable: ${key}`)
        }
        return envVal;
    })
}