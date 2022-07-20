import fs from 'fs';
import path from 'path';
import readDir from '../utils/readDir';
import { Gaia } from '../types';

export default async (app: Gaia.GaiaApplication) => {
  const customMiddlewarePath = path.join(app.appPath, './middleware');
  if (fs.existsSync(customMiddlewarePath)) {
    // 读取middleware目录下的文件
    const weightMiddleware: Gaia.CustomMiddlewareType[] = [];
    const autoMiddleware: Gaia.CustomMiddlewareType[] = [];
    await readDir(customMiddlewarePath, app.appType, async (file) => {
      const middlewareController = await import(file);

      // 如果是直接定义的函数，那么该中间的加载权重设置为默认
      if (typeof (middlewareController.default) === 'function') {
        autoMiddleware.push({
          weight: 'auto',
          run: middlewareController.default,
        });
        return;
      }

      // 如果是对象，合并到现有列表
      if (middlewareController.default.weight === undefined || middlewareController.default.weight === 'auto') {
        autoMiddleware.push({
          weight: 'auto',
          ...middlewareController.default,
        });
      } else {
        weightMiddleware.push(middlewareController.default);
      }
    });
    // 按中间件权重排序，权重由大到小
    weightMiddleware.sort((left, right) => (left.weight > right.weight ? -1 : 1));

    [...weightMiddleware, ...autoMiddleware].forEach((middleware) => {
      app.use(middleware.run);
    });
  }
};
