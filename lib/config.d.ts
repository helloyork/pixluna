import { Schema } from "koishi";
export interface Config {
    isR18: boolean;
    isProxy: boolean;
    proxyHost: string;
    r18P: number;
    excludeAI: boolean;
}
export declare const Config: Schema<Config>;
export default Config;
