import { Context, h, Random } from "koishi";
import type { } from "@koishijs/plugin-proxy-agent";
import Config from "../config";
import { Lolicon, LoliconRequest, SourceProvider } from "../types/type";
import {
  getImageMimeType,
  IMAGE_MINE_TYPE,
  mixImage,
  qualityImage,
} from "../utils/imageConfusion";
import { taskTime } from "../utils/data";

const RANDOM_IMAGE_URL = "https://api.lolicon.app/setu/v2";

export async function getRemoteImage(ctx: Context, tag: string, config: Config, provider: SourceProvider<any> | null): Promise<Lolicon & {
  data: string | h;
  raw: Lolicon;
} | null> {
  if (!provider) {
    ctx.logger.error("missing provider");
    return null;
  }

  let sharp;
  try {
    sharp = (await import("sharp"))?.default;
  } catch {}

  if ((config.imageConfusion || config.compress) && !sharp) {
    ctx.logger.warn(
      "启用了图片混淆或者图片压缩选项，但是没有检查到安装 sharp 服务，这些配置将无效。请安装 sharp 服务。",
    );
  }

  const params = {
    size: ["original", "regular"],
    r18: config.isR18 ? (Random.bool(config.r18P) ? 1 : 0) : 0,
    excludeAI: config.excludeAI,
    tag: tag ? tag.split(" ").join("|") : void 0,
    proxy: config.baseUrl ? config.baseUrl : void 0,
  };

  const srcProvider = provider;
  const metadata = await srcProvider.getMetaData({
    context: ctx,
  }, params);

  if (metadata.status === "error") {
    return null;
  }

  const response = metadata.data;
  const {url, urls} = response;

  const data = await taskTime(ctx, "mixImage", async () => {
    const imageBufferArray = await fetchImageBuffer(ctx, config, url);

    if (config.imageConfusion && sharp) {
      return await mixImage(
        ctx,
        imageBufferArray,
        config.compress && !urls.regular,
      );
    }

    return h.image(
      config.compress && !urls.regular && sharp
        ? await qualityImage(ctx, imageBufferArray[0], imageBufferArray[1])
        : imageBufferArray[0],
      getImageMimeType(imageBufferArray[1]),
    );
  });

  return {
    ...metadata.data.raw,
    data,
    raw: metadata.data.raw,
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

