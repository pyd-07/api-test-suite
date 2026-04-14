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
            const result = await worker(baseUrl, item)
            results[currentIndex] = result
        }
    }

    const workers = Array.from({length: limit}, ()=>runWorker())

    await Promise.all(workers)

    return results
}