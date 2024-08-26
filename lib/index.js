"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
exports.apply = apply;
const jsx_runtime_1 = require("@satorijs/element/jsx-runtime");
const koishi_1 = require("koishi");
const HttpUtil_1 = require("./util/HttpUtil");
exports.name = '@q78kg/pixiv';
let date = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
__exportStar(require("./config"), exports);
const pixivUrl = {
    url: 'https://api.lolicon.app/setu/v2'
};
let _config;
function apply(ctx, config) {
    const logger = ctx.logger('pixiv');
    _config = config;
    ctx.command('来张色图 [tag:text]', '随机一张色图')
        .option('n', '-n <value:number>', {
        fallback: 1,
    })
        .alias('色图')
        .action(async ({ session, options }, tag) => {
        let image;
        await session.send('不可以涩涩哦~');
        const messages = [];
        for (let i = 0; i < Math.min(10, options.n); i++) {
            try {
                image = await getPixivImage(ctx, tag);
                if (image.urls === undefined) {
                    messages.push((0, jsx_runtime_1.jsx)("message", { children: (0, jsx_runtime_1.jsx)("text", { content: '没有获取到喵\n' }) }));
                }
                else {
                    messages.push((0, jsx_runtime_1.jsxs)("message", { children: [(0, jsx_runtime_1.jsx)("image", { url: image.urls.original }), (0, jsx_runtime_1.jsx)("text", { content: `\ntitle：${image.title}\n` }), (0, jsx_runtime_1.jsx)("text", { content: `id：${image.pid}\n` }), (0, jsx_runtime_1.jsx)("text", { content: `tags：${image.tags.map((item) => {
                                    return '#' + item;
                                }).join(' ')}\n` })] }));
                }
            }
            catch (e) {
                messages.push((0, jsx_runtime_1.jsx)("message", { children: (0, jsx_runtime_1.jsx)("text", { content: `图片获取失败了喵~，code:${e.code}` }) }));
            }
        }
        session.send((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("message", { forward: true, children: messages }) })).then(res => {
            if (res.length === 0) {
                logger.error(`消息发送失败，账号可能被风控`);
                session.send((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("at", { id: session.userId }), (0, jsx_runtime_1.jsx)("text", { content: '消息发送失败了喵，账号可能被风控\n' })] }));
            }
        });
    });
}
async function getPixivImage(ctx, tag) {
    const params = {};
    if (_config.isR18) {
        params['r18'] = koishi_1.Random.bool(_config.r18P) ? 1 : 0;
    }
    else {
        params['r18'] = 0;
    }
    if (tag !== undefined) {
        params['tag'] = tag.split(' ').join('|');
    }
    // 增加排除 AI 作品的逻辑
    if (_config.excludeAI) {
        params['excludeAI'] = true;
    }
    const res = await ctx.http.get(HttpUtil_1.HttpUtil.setParams(pixivUrl.url, params), getAxiosConfig());
    return res.data[0];
}
const getAxiosConfig = () => {
    if (!_config.isProxy) {
        return undefined;
    }
    const proxyUrl = new URL(_config.proxyHost);
    return {
        proxy: {
            host: proxyUrl.hostname,
            port: Number(proxyUrl.port),
            protocol: proxyUrl.protocol.replace(':', ''),
        },
        method: 'GET', // 这里明确指定 method 的类型
    };
};
