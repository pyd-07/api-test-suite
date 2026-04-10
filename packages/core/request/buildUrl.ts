import {queryParams} from "@repo/core/types/test"

export function buildUrl(baseUrl:string, requestUrl:string, query?: queryParams){
    const url = new URL(requestUrl, baseUrl)
    if(query){
        for (const [key, value] of Object.entries(query)){
            url.searchParams.append(key, String(value))
        }
    }
    return url
}