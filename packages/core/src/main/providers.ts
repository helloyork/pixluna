import { SourceProvider } from "../types/type";
import { PixivSourceProvider } from "./providers/pixiv";

export type ProviderTypes = "pixiv";
export const Providers: {
  [K in ProviderTypes]: typeof SourceProvider;
} = {
  "pixiv": PixivSourceProvider,
};

export function getProvider(provider: string): typeof SourceProvider | undefined {
  if (provider in Providers) {
    return Providers[provider as ProviderTypes];
  } else {
    console.warn(`Unknown provider: ${provider}. Defaulting to 'pixiv'.`);
    return Providers["pixiv"];  // 默认返回 pixiv
  }
}
