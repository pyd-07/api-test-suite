import { ValidatedTest } from "../schema/schema";

export async function runWithRetry(
    fn: () => Promise<ValidatedTest>,
    retries: number = 2,
    delay: number = 100,
    onRetry?: (attempt: number, maxRetries: number) => void
): Promise<ValidatedTest>{
    let lastErr: any

    for (let attempt=0; attempt<retries; attempt++){
        try {
            return await fn()
        } catch (err: any) {
            lastErr = err
            if (attempt<retries - 1){
               onRetry?.(attempt + 1, retries)
               if(delay>0){
                await new Promise(res => setTimeout(res, delay))
               } 
            }
        }
    }
    throw lastErr
}