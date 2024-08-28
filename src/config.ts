import { Schema } from "koishi";

export interface Config {
  isR18: boolean;
  r18P: number;
  excludeAI: boolean;

  isProxy: boolean;
  proxyHost: string;
  baseUrl: string;

  imageConfusion: boolean;
}

// @ts-ignore
export const Config: Schema<Config> = Schema.intersect([

  // 分类：内容过滤选项
  Schema.object({
    isR18: Schema.boolean()
      .default(false)
      .description('是否开启 R18 内容过滤'),

    excludeAI: Schema.boolean()
      .default(false)
      .description('是否排除 AI 作品'),

    r18P: Schema.percent()
      .default(0.1)
      .description('R18 内容显示的概率')
      .min(0)
      .max(1)
      .step(0.01),
  }).description('内容过滤设置'),

  // 分类：代理选项
  Schema.union([
    Schema.object({
      isProxy: Schema.const(false).description('不使用代理'),
    }),
    Schema.object({
      isProxy: Schema.const(true).description('使用代理'),
      proxyHost: Schema.string()
        .default('http://127.0.0.1:7890')
        .description('代理服务器地址'),
    })
  ]).description('代理设置'),

  // 分类：图片处理选项
  Schema.object({
    baseUrl: Schema.string()
      .default('i.pixiv.re')
      .description('图片反代服务的基础 URL'),

    imageConfusion: Schema.boolean()
      .default(false)
      .description('是否开启图片混淆处理')
  }).description('图片处理设置')
]);

export default Config;
