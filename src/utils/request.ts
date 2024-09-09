import { Context, h, Random } from "koishi";
import type {} from "@koishijs/plugin-proxy-agent";
import Config from "../config";
import { Lolicon, LoliconRequest } from "../type";
import {
  getImageMimeType,
  IMAGE_MINE_TYPE,
  mixImage,
  qualityImage,
} from "./image_confusion";

const RANDOM_IMAGE_URL = "https://api.lolicon.app/setu/v2";

export async function getPixivImage(ctx: Context, tag: string, config: Config) {
  const params: Record<string, any> = {
    size: ["original", "regular"],
    r18: config.isR18 ? (Random.bool(config.r18P) ? 1 : 0) : 0,
    excludeAI: config.excludeAI,
  };

  if (tag !== undefined) {
    params["tag"] = tag.split(" ").join("|");
  }

  if (config.baseUrl) {
    params["proxy"] = config.baseUrl;
  }

  const res = await ctx.http
    .post<LoliconRequest>(RANDOM_IMAGE_URL, params, {
      proxyAgent: config.isProxy ? config.proxyHost : undefined,
    })
    .then(async (res) => {
      return res.data?.[0];
    });

  if (!res || (!res?.urls?.regular && !res.urls?.original)) {
    return null;
  }

  let url = res.urls.original;

  if (config.compress) {
    url = res.urls.regular || res.urls.original;
  }

  const data = await taskTime(ctx, "mixImage", async () => {
    const imageBufferArray = await fetchImageBuffer(ctx, config, url);

    if (config.imageConfusion) {
      return await mixImage(imageBufferArray, (config.compress && !res.urls.regular));
    }

    return h.image(
      (config.compress && !res.urls.regular)
        ? await qualityImage(imageBufferArray[0], imageBufferArray[1])
        : imageBufferArray[0],
      getImageMimeType(imageBufferArray[1]),
    );
  });

  return {
    data,
    raw: res,
    ...res,
  } satisfies Lolicon & {
    data: h;
    raw: Lolicon;
  };
}

async function fetchImageBuffer(
  ctx: Context,
  config: Config,
  url: string,
): Promise<[ArrayBuffer, IMAGE_MINE_TYPE]> {
  return taskTime(ctx, "fetchImage", async () => {
    const response = await ctx.http.get(url, {
      responseType: "arraybuffer",
      proxyAgent: config.isProxy ? config.proxyHost : undefined,
    });
    const extension = url.split(".").pop()?.toLowerCase();

    return [response, getImageMimeType(extension)];
  });
}

export async function taskTime<T>(
  ctx: Context,
  name: string,
  task: () => Promise<T>,
): Promise<T> {
  const start = Date.now();

  return task().finally(() => {
    ctx.logger.debug(`task: ${name}, time: ${Date.now() - start}ms`);
  });
}
