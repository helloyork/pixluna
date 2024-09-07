import { Schema } from "koishi";

export interface Config {
  isR18: boolean;
  isProxy: boolean;
  proxyHost: string;
  r18P: number;
  excludeAI: boolean;
  baseUrl: string;
  imageConfusion: boolean;
}

// @ts-ignore
export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    // 通用设置
    isR18: Schema.boolean().default(false).description('是否允许返回 R18 内容'),
    isProxy: Schema.boolean().default(false).description('是否使用代理'),
    excludeAI: Schema.boolean().default(false).description('是否排除 AI 生成作品'),
    baseUrl: Schema.string().default('i.pixiv.re').description('图片反代服务的地址'),
    imageConfusion: Schema.boolean().default(false).description('是否启用图片混淆处理')
  }).description('通用设置'),

  Schema.union([
    Schema.object({
      isProxy: Schema.const(true),
      proxyHost: Schema.string().default('http://127.0.0.1:7890').description('代理服务器地址'),
    }).description('代理设置')
  ]),

  Schema.union([
    Schema.object({
      isR18: Schema.const(true),
      r18P: Schema.percent().default(0.1).description('R18 内容出现的概率')
        .min(0).max(1).step(0.01),
    }).description('R18 内容设置')
  ])
]);

export default Config;
