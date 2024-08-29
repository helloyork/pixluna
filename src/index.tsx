import { Context, Random } from 'koishi';
import { AxiosRequestConfig, Method } from "axios";

import { mixImage } from './utils/ImageConfusion';
import { Lolicon } from "./utils/Interface";
import { HttpUtil } from "./utils/HttpUtil";

import type Config from "./config";

const pixivUrl = {
  url: 'https://api.lolicon.app/setu/v2'
};

let _config: Config;

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('pixiv');
  _config = config;
  ctx.command('来张色图 [tag:text]', '随机一张色图')
    .option('n', '-n <value:number>', {
      fallback: 1,
    })
    .alias('色图')
    .action(async ({ session, options }, tag) => {
      let image: Lolicon;
      await session.send('不可以涩涩哦~');
      const messages = [];
      for (let i = 0; i < Math.min(10, options.n); i++) {
        try {
          image = await getPixivImage(ctx, tag);
          if (!image || !image?.urls?.original) {
            messages.push(
              <message>
                <text content={'没有获取到喵\n'}></text>
              </message>
            );
          } else {
            const dataurl = config.useMix ? await mixImage(image) : image.urls.original;

            messages.push(
              <message>
                <image url={dataurl}></image>
                <text content={`\ntitle：${image.title}\n`}></text>
                <text content={`id：${image.pid}\n`}></text>
                <text content={`tags：${image.tags.map((item) => {
                  return '#' + item;
                }).join(' ')}\n`}></text>
              </message>
            );
          }
        } catch (e) {
          messages.push(
            <message>
              <text content={`图片获取失败了喵~，${e}`}></text>
            </message>
          );
        }
      }
      session.send(
        <>
          <message forward={true}>
            {messages}
          </message>
        </>
      ).then(res => {
        if (res.length === 0) {
          logger.error(`消息发送失败，账号可能被风控`);
          session.send(
            <>
              <at id={session.userId}></at>
              <text content={'消息发送失败了喵，账号可能被风控\n'}></text>
            </>
          );
        }
      });
    });
}

async function getPixivImage(ctx: Context, tag: string) {
  const params: Record<string, any> = {};
  if (_config.isR18) {
    params['r18'] = Random.bool(_config.r18P) ? 1 : 0;
  } else {
    params['r18'] = 0;
  }

  if (tag !== undefined) {
    params['tag'] = tag.split(' ').join('|');
  }

  if (_config.excludeAI) {
    params['excludeAI'] = true;
  }

  if (_config.baseUrl) {
    params['proxy'] = _config.baseUrl;
  }

  const res = await ctx.http.get(HttpUtil.setParams(pixivUrl.url, params), getAxiosConfig() as any);
  return res.data[0];
}

const getAxiosConfig = (): AxiosRequestConfig | undefined => {
  if (!_config.isProxy) {
    return undefined;
  }

  const proxyUrl = new URL(_config.proxyHost);
  return {
    proxy: {
      host: proxyUrl.hostname,
      port: Number(proxyUrl.port),
      protocol: proxyUrl.protocol.replace(':', '') as 'http' | 'https',
    },
    method: 'GET' as Method,
  };
};

function getImageMimeType(url: string): string {
  const MimeType = url.split('.').pop();
  const TypeMap = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
  };
  return TypeMap[MimeType];
}

function arrayBufferToDataUrl(arrayBuffer: ArrayBuffer, type: string): string {
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${type};base64,${base64}`;
}

export * from './config';
