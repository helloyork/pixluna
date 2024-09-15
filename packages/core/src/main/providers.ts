import { Context } from "koishi";
import { SourceProviderService } from "../service/source";
import { SourceProvider } from "../types/type";

export function getProvider(provider: string, ctx: Context): SourceProvider<any> | undefined {
  if (SourceProviderService.getInstance()?.getProviderNames().includes(provider)) {
    return SourceProviderService.getInstance().getProvider(provider)!;
  } else {
    ctx.logger.warn(`Unknown provider: ${provider}.`);
    return null;
  }
}
