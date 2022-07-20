import path from 'path';
import fs from 'fs';
import Router from 'koa-router';
import readDir from '../utils/readDir';
import { Gaia } from '../types';

const initDirRoute = async (app: Gaia.GaiaApplication) => {
  const router = new Router();
  const routesPath = path.join(app.appPath, './routes');
  const allowedMethods = ['get', 'put', 'post', 'delete'];
  if (fs.existsSync(routesPath)) {
    await readDir(routesPath, app.appType, async (file) => {
      const routePath = file.replace(routesPath, '').replace(`.${app.appType}`, '') || '/';
      const routeController = await import(file);
      allowedMethods.forEach((method) => {
        router[method](routePath, routeController.default);
      });
    });
  }
  return router;
};

// 使用配置类型的路由时，遍历路由配置，将路由打平
const formatRoute = (routeConfig: Gaia.RouteType[]) => {
  const routeArray: Gaia.RouteType[] = [];
  const getRoutes = (currentConfig: Gaia.RouteType[], prefix: string) => {
    currentConfig.forEach((route) => {
      const routePath = `${prefix}/${route.path}`.replace(/\/{2,}/g, '/');
      if (route.controller) {
        routeArray.push({
          path: routePath,
          method: route.method || 'get',
          controller: route.controller,
        });
      }
      if (route.children) {
        getRoutes(route.children, routePath);
      }
    });
  };
  getRoutes(routeConfig, '/');
  return routeArray;
};

const initConfigRoute = async (app: Gaia.GaiaApplication) => {
  const router = new Router();
  const routesPath = path.join(app.appPath, `./configs/routes.${app.appType}`);
  if (fs.existsSync(routesPath)) {
    const getrRouteConfig = await import(routesPath);
    const routeConfig: Gaia.RouteType[] = await getrRouteConfig.default();
    const routes = formatRoute(routeConfig);
    // 将格式化的路由全部挂载到koa-router中
    routes.forEach((route) => {
      router[route.method as string](route.path, route.controller);
    });
  }
  return router;
};

export default async (app: Gaia.GaiaApplication, routeType: 'config' | 'dir' = 'config') => {
  let router: null | Router = null;
  switch (routeType) {
    case 'dir':
      router =  await initDirRoute(app);
      break;
    case 'config':
      router =  await initConfigRoute(app);
      break;
    default:
      break;
  }
  if (router) {
    app.use(router.routes()).use(router.allowedMethods());
  }
};
