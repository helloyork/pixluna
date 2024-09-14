import { SourceProvider } from "../types/type";
import { LoliconSourceProvider } from "./providers/lolicon";

export type ProviderTypes = "lolicon";
export const Providers: {
  [K in ProviderTypes]: typeof SourceProvider;
} = {
  "lolicon": LoliconSourceProvider,
};

export function getProvider(provider: string): typeof SourceProvider | undefined {
  if (provider in Providers) {
    return Providers[provider as ProviderTypes];
  } else {
    console.warn(`Unknown provider: ${provider}. Defaulting to 'lolicon'.`);
    return Providers["lolicon"];  // 默认返回 pixiv
  }
}
