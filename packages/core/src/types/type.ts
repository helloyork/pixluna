import type { Context } from "koishi";

export interface Pixivic {
  id: number; // 作品id
  title: string; // 作品标题

  imageUrls: {
    large: string; // 大图
    medium: string; // 中图
    original: string; // 原图
    squareMedium: string; // 小图
  }[];

  tags: {
    name: string; // 标签名
    translatedName: string; // 标签翻译
  }[];

  createDate: string; // 作品创建时间
}

export interface Vilipix {
  original_url: string;
  title: string;
  tags: string;
  picture_id: string;
}

export interface Lolicon {
  pid: number;
  p: number;
  uid: number;
  title: string;
  author: string;
  r18: false;
  tags: string[];
  ext: number;
  aiType: number;
  uploadDate: number;
  urls: {
    regular: string; // 中图
    original: string; // 原图
  };
}

export interface LoliconRequest {
  error?: string;
  data: Lolicon[];
}

export type ImageMimeType = "jpg" | "jpeg" | "png" | "gif";

export interface ImageMetaData {
  url: string;
  urls: {
    regular?: string;
  },
  raw: Lolicon
}

export interface CommonSourceRequest {
  tag?: string;
  size?: string[];
  r18?: number;
  excludeAI?: boolean;
  proxy?: string;
}

export interface CommonSourceResponse {
  image: ArrayBuffer;
  metaData: ImageMetaData
}

export type SourceResponseStatus = "success" | "error";
export type SourceResponse<T, U extends SourceResponseStatus = SourceResponseStatus> =
  U extends "success" ? {
    status: U;
    data: T;
  } : U extends "error" ? {
    status: U;
    data: Error | string | null | undefined;
  } : {
    status: SourceResponseStatus;
    data: any;
  }

export abstract class SourceProvider<T> {
  config: T;
  /**
   * Human-readable name
   */
  name: string;
  abstract getMetaData(ctx: {context: Context}, props: CommonSourceRequest):
    Promise<SourceResponse<ImageMetaData>>;

  constructor(ctx: Context, config: T) {
    this.config = config;
  }

  setName(name: string): this {
    this.name = name;
    return this;
  }
}

