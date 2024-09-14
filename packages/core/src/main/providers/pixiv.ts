import { Context } from "koishi";
import type { Config } from "../../config";  // 确保导入的是类型
import type { CommonSourceRequest, ImageMetaData, LoliconRequest, SourceResponse } from "../../types/type";
import { SourceProvider } from "../../types/type";

export class PixivSourceProvider extends SourceProvider {
  static RANDOM_IMAGE_URL = "https://api.lolicon.app/setu/v2";

  config: Config;

  async getMetaData({ context }: { context: Context }, props: CommonSourceRequest): Promise<SourceResponse<ImageMetaData>> {
    const res = await context.http
      .post<LoliconRequest>(PixivSourceProvider.RANDOM_IMAGE_URL, props, {
        proxyAgent: this.config.isProxy ? this.config.proxyHost : undefined,
      })
      .then(async (res) => {
        return res.data?.[0];
      });

    if (!res || (!res?.urls?.regular && !res.urls.original)) {
      return {
        status: "error",
        data: null
      };
    }

    const url = this.config.compress ? res.urls.original : (res.urls.regular || res.urls.original);

    return {
      status: "success",
      data: {
        url: url,
        urls: {
          regular: res?.urls?.regular
        },
        raw: res,
      }
    };
  }

  setConfig(config: Config) {
    this.config = config;
  }
}
