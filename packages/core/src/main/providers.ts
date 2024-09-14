import { SourceProvider } from "../types/type";
import { PixivSourceProvider } from "./providers/pixiv";

export type ProviderTypes = "pixiv";
export const Providers: {
    [K in ProviderTypes]: typeof SourceProvider;
} = {
    "pixiv": PixivSourceProvider,
};

export function getProvider(provider: ProviderTypes) {
    return Providers[provider];
}

