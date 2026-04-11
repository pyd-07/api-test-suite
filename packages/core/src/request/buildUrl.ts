import {QueryParams} from "../schema/schema"

export function buildUrl(baseUrl:string, requestUrl:string, query?: QueryParams){
    const url = new URL(requestUrl, baseUrl)
    if(query){
        for (const [key, value] of Object.entries(query)){
            url.searchParams.append(key, String(value))
        }
    }
    return url
}