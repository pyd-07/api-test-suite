import {RequestConfig, Headers} from "../schema/schema"


export function buildHeaders(request: RequestConfig){
    let headers: Headers = request.headers || {}

    // This is helper block added , because the fetch with header 'Content-Type' kept returning status code 500
    // but the request with header 'content-type' successfully fulfilled the request
    // hence I'll keep this helper block
    if (request.body && !headers['content-type']){
        headers['content-type'] = 'application/json'
    }

    return headers
}