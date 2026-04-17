import {TestCase, ValidatedTest} from "../schema/schema"

export async function runWithConcurrency(
    baseUrl: string,
    items: TestCase[],
    limit: number,
    worker: (baseUrl: string , item: TestCase) => Promise<ValidatedTest>
): Promise<ValidatedTest[]> {
    
    const results: ValidatedTest[] = new Array(items.length)
    let index = 0

    async function runWorker() {
        while (true) {
            const currentIndex = index++
            const item = items[currentIndex]
            if(!item) break
            try{
                const result = await worker(baseUrl, item)
                results[currentIndex] = result
            } catch (err:any) {
                results[currentIndex] = {
                    name: item.name,
                    stat: "fail",
                    failReason: err.message || String(err)
                };
            }
        }
    }

    const workers = Array.from({length: limit}, ()=>runWorker())

    await Promise.all(workers)

    return results
}