import { Awaitable, Context, Service } from "koishi";
import { SourceProvider } from "../types/type";
import EventEmitter from "events";

export class SourceProviderService<T extends Record<any, any>> extends Service {
    private static instance: SourceProviderService<any> | undefined;
    static SPSEvents = {
        start: "start",
        stop: "stop",
        register: "register",
    }
    readonly events = new EventEmitter();
    static getInstance<T extends Record<any, any>>() {
        return this.instance as SourceProviderService<T> | undefined;
    }

    protected providers: { [key: string]: SourceProvider<any> } = {};
    constructor(ctx: Context, config: T) {
        super(ctx, 'pixluna', true);
        this.config = config;

        if (!SourceProviderService.instance) {
            SourceProviderService.instance = this;
        }
    }

    registerProvider(provider: SourceProvider<any>) {
        if (!(provider instanceof SourceProvider)) {
            this.ctx.logger.error('Invalid provider');
            throw new Error('Invalid provider');
        }
        this.ctx.logger.info(`Provider ${provider.name} registered`);
        this.providers[provider.name] = provider;

        this.events.emit(SourceProviderService.SPSEvents.register, provider);
    }

    getProviderNames() {
        return Object.keys(this.providers);
    }

    getProvider(name: string): SourceProvider<any> {
        return this.providers[name];
    }

    on(eventName: typeof SourceProviderService.SPSEvents[keyof typeof SourceProviderService.SPSEvents], e: (...args: any[]) => void) {
        this.events.on(eventName, e);
    }

    off(eventName: typeof SourceProviderService.SPSEvents[keyof typeof SourceProviderService.SPSEvents], e: (...args: any[]) => void) {
        this.events.off(eventName, e);
    }

    protected start(): Awaitable<void> {
        this.events.emit(SourceProviderService.SPSEvents.start);
        return Promise.resolve();
    }

    protected stop(): Awaitable<void> {
        this.events.emit(SourceProviderService.SPSEvents.stop);
        return Promise.resolve();
    }
}

