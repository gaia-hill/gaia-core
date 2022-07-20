import koaCompress from 'koa-compress';
import koaBody from 'koa-body';
import { Gaia } from '../types';

// 绑定一些第三方的中间件
export default (app: Gaia.GaiaApplication, appConfig: Gaia.GaiaConfig) => {
  const { bodyparser: bodyparserConfig = {}, compress: compressConfig = {} } = appConfig;
  app.use(koaBody({
    multipart: true,
    parsedMethods: ['POST', 'PUT', 'DELETE'],
    ...bodyparserConfig,
  }));

  app.use(koaCompress({
    threshold: 2048,
    br: false,
    ...compressConfig,
  }));
};
