import Koa from 'koa';
import urlparse from 'url-parse';
import qs from 'querystring';
import path from 'path';
import fs from 'fs';
import { DEFAULT_CONFIG_PATH } from '../constant';
import { Gaia } from '../types';

export default async (app: Gaia.GaiaApplication) => {
  const { appPath, appType } = app;

  // 获取rewrite的配置
  const configPathDir = path.join(appPath, DEFAULT_CONFIG_PATH);
  const rewritePath = path.join(configPathDir, `./rewrite.${appType}`);
  if (fs.existsSync(rewritePath)) {
    const getRewriteConfig = await import(rewritePath);
    const rewriteConfigs: Gaia.RewriteConfigType[] = getRewriteConfig.default();

    // 如果存在rewrite配置，则加载此中间件
    app.use(async (ctx: Gaia.GaiaContext, next: Koa.Next) => {
      for (const config of rewriteConfigs) {
        if (!config.from) continue;

        // 看当前的请求路径是否能匹配from参数
        const isMatch = isMatchFrom(ctx.request.path, config.from);
        if (!isMatch) continue;

        // 如果匹配则重置request的path，并透传query参数
        const target: string = config.to;
        const { query = '', pathname } = urlparse(target);
        ctx.request.query = { ...ctx.request.query, ...qs.parse(query || '') };
        ctx.request.path = pathname || '/';

        // 如果当前匹配的重定向规则配置了break属性，则不再继续向下匹配
        if (config.break === true) break;
      }
      await next();
    });
  }
};

function isMatchFrom(requestPath: string, from: string | RegExp) {
  if (typeof (from) === 'string') {
    return true;
  }

  if (from instanceof RegExp) {
    return from.test(requestPath);
  }

  return false;
}
