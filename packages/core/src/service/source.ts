import { Context, Service } from "koishi";
import { SourceProvider } from "../types/type";

export class SourceProviderService<T extends Record<any, any>> extends Service {
    private static instance: SourceProviderService<any> | undefined;
    static getInstance<T extends Record<any, any>>() {
        return this.instance as SourceProviderService<T> | undefined;
    }

    protected providers: { [key: string]: SourceProvider<any> } = {};
    constructor(ctx: Context, config: T) {
        super(ctx, 'pixluna', true);
        this.config = config;   
    }

    registerProvider(provider: SourceProvider<any>) {
        this.ctx.logger.debug(`Registering provider ${provider.name}`);
        if (!(provider instanceof SourceProvider)) {
            throw new Error('Invalid provider');
        }
        this.providers[provider.name] = provider;
    }

    getProviderNames() {
        return Object.keys(this.providers);
    }

    getProvider(name: string): SourceProvider<any> {
        return this.providers[name];
    }
}

