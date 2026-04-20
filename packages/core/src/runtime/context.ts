export class RuntimeContext {
    private store: Map<string, any>

    constructor(initial?: Record<string, any>) {
        this.store = new Map(Object.entries(initial ?? {}));
    }

    get(key:string) {
        return this.store.get(key)
    }

    set(key:string, value:any) {
        this.store.set(key, value)
    }

    has(key:string) {
        return this.store.has(key)
    }

    getAll():Record<string, any> {
        return Object.fromEntries(this.store)
    }
}