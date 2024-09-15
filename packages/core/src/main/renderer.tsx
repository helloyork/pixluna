import { Context } from "koishi";
import Config from "../config";
import { getRemoteImage } from "./request";
import { getProvider } from "./providers";

export async function render(ctx: Context, config: Config, tag: string) {
  try {
    const image = await getRemoteImage(ctx, tag, config, getProvider(config.srcProvider, ctx));

    if (!image) {
      return (
        <>
          <message>
            <text content={"没有获取到喵\n"}></text>
          </message>
        </>
      );
    }

    ctx.logger.debug("image " + JSON.stringify(image));

    const data = typeof image.data === "string" ? (
      <image url={image.data}></image>
    ) : (
      image.data
    );

    return (
      <>
        {data}
        <text content={`\ntitle：${image.title}\n`}></text>
        <text content={`id：${image.pid}\n`}></text>
        <text
          content={`tags：${image.tags
            .map((item: string) => {
              return "#" + item;
            })
            .join(" ")}\n`}
        ></text>
      </>
    );
  } catch (e) {
    ctx.logger.error(e);

    return (
      <>
        <message>
          <text content={`图片获取失败了喵~，${e}`}></text>
        </message>
      </>
    );
  }
}
