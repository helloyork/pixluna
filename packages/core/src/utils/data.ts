import { Context } from "koishi";

export class ParallelPool<T = any> {
  private readonly pool: Array<Promise<T>>;
  private readonly limit: number;

  constructor(limit: number) {
    this.pool = [];
    this.limit = limit;
  }

  add<R extends T>(promise: Promise<R>): this;
  add<R extends T>(promise: Promise<R>[]): this;
  add<R extends T>(promise: Promise<R> | Promise<R>[]): this {
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
      results.push(...(await Promise.all(promises)));
    }
    return results;
  }
}

export async function taskTime<T>(
  ctx: Context,
  name: string,
  task: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  return task().finally(() => {
    ctx.logger.debug(`task: ${name}, time: ${Date.now() - start}ms`);
  });
}



