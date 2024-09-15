import { SourceProviderService } from "../service/source";
import { SourceProvider } from "../types/type";

export function getProvider(provider: string): SourceProvider<any> | undefined {
  if (SourceProviderService.getInstance()?.getProviderNames().includes(provider)) {
    return SourceProviderService.getInstance().getProvider(provider)!;
  } else {
    console.warn(`Unknown provider: ${provider}. Defaulting to 'lolicon'.`);
    return null;
  }
}
