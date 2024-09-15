import type Config from "./config";
import { Context, h } from "koishi";
import { ParallelPool } from "./utils/data";
import { render } from "./main/renderer";
import { taskTime } from "./utils/data";
import { SourceProviderService } from "./service/source";

declare module 'koishi' {
  interface Context {
    pixluna: SourceProviderService<any>
  }
}

export function apply(ctx: Context, config: Config) {
  ctx.plugin(SourceProviderService, config);

  ctx
    .command("来张色图 [tag:text]", "随机一张色图")
    .option("n", "-n <value:number>", {
      fallback: 1,
    })
    .alias("色图")
    .action(async ({ session, options }, tag) => {
      await session.send("不可以涩涩哦~");

      const messages: h[] = [];
      const pool = new ParallelPool<void>(config.maxConcurrency);

      for (let i = 0; i < Math.min(10, options.n); i++) {
        pool.add(
          taskTime(ctx, `${i + 1} image`, async () => {
            const message = await render(ctx, config, tag);
            messages.push(message);
          }),
        );
      }

      await pool.run();

      let id: string[];
      try {
        id = await taskTime(ctx, "send message", () => {
          if (config.forwardMessage) {
            return session.send(
              <>
                <message forward={config.forwardMessage}>{messages}</message>
              </>,
            );
          }

          return session.send(messages);
        });
      } catch (e) {
        ctx.logger.error(e);
      }

      if (id === undefined || id.length === 0) {
        ctx.logger.error(`消息发送失败，账号可能被风控`);

        return (
          <>
            <at id={session.userId}></at>
            <text content={" 消息发送失败了喵，账号可能被风控\n"}></text>
          </>
        );
      }
    });
}

export * from "./config";
export * from "./types/type";
