
export class ParallelPool {
    private readonly pool: Array<Promise<any>>;
    private readonly limit: number;
    
    constructor(limit: number) {
        this.pool = [];
        this.limit = limit;
    }
    
    add<T>(promise: Promise<T>): this;
    add<T>(promise: Promise<T>[]): this;
    add<T>(promise: Promise<T> | Promise<T>[]): this {
        const promises = Array.isArray(promise) ? promise : [promise];
        for (const p of promises) {
            this.pool.push(p);
        }
        return this;
    }

    async run() {
        const results = [];
        for (let i = 0; i < this.pool.length; i += this.limit) {
            const promises = this.pool.slice(i, i + this.limit);
            results.push(...await Promise.all(promises));
        }
        return results;
    }
}

