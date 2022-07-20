import path from 'path';
import koaMount from 'koa-mount';
import koaStatic from 'koa-static';
import { Gaia } from '../types';

// 初始化静态资源目录
export default async (appPath: string, staticConfig: Gaia.StaticOptions) => {
  const staticPath = path.join(appPath, staticConfig.staticPath as string);
  const staticPathPrefix = staticConfig.public as string;
  return koaMount(
    staticPathPrefix,
    koaStatic(staticPath, staticConfig),
  );
};
