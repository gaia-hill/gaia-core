import Koa from 'koa';
import { Gaia } from './types';
import { Server } from 'http';
import thirdware from './middleware/thridware';
import staticMiddleware from './middleware/static';
import viewMiddleware from './middleware/views';
import customMiddleware from './middleware/custom';
import router from './middleware/router';
import { getAppConfig } from './config';
import rewriteMiddleware from './middleware/rewrite';

export default class GaiaApp {
  public app: Gaia.GaiaApplication;

  // 初始化process，需指定是否是ts项目，因为在加载文件时需要判断
  constructor(appPath: string, appType: 'ts' | 'js' = 'js') {
    this.app = new Koa() as Gaia.GaiaApplication;
    this.app.appType = appType;
    this.app.appPath = appPath;
  }

  public start = async (): Promise<Server> => {
    const { appPath } = this.app;

    // 获取应用配置
    const appConfig: Gaia.GaiaConfig = await getAppConfig(this.app);
    // 绑定第三方中间件
    thirdware(this.app, appConfig);

    if (appConfig.cors) {
      const cors = await import('@koa/cors');
      this.app.use(cors.default(appConfig.cors));
    }

    this.app.use(async (ctx, next) => {
      ctx.app = this.app;
      await next();
    });

    // 初始化需要重定向的路由
    await rewriteMiddleware(this.app);

    this.app.use(await staticMiddleware(appPath, appConfig.static as Gaia.StaticOptions));

    this.app.use(viewMiddleware(appPath, appConfig.view as Gaia.ViewOptions));

    await customMiddleware(this.app);

    // 绑定路由
    await router(this.app, appConfig.routeType);

    const server = this.app.listen(appConfig.port);
    console.log(`
    当前环境：${process.env.NODE_ENV}
    启动成功：端口${appConfig.port}
    `);
    return server;
  };
}

export { Gaia };
