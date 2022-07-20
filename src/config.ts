import { APP_CONFIG_PATH, STATIC_PATH, STATIC_PATH_PREFIX } from './constant';
import path from 'path';
import fs from 'fs';
import merge from 'lodash.merge';
import { Gaia } from './types';

const getDefaultConfig = async (appPath: string): Promise<Gaia.GaiaConfig> => ({
  port: 3005,
  routeType: 'config',
  cors: false,

  static: {
    public: STATIC_PATH_PREFIX,
    staticPath: path.join(appPath, STATIC_PATH),
    maxAge: 30 * 24 * 60 * 60,   // 缓存时间
  },

  view: {
    type: 'ejs',
    cache: true,
    data: {},
  },
});

export const getAppConfig  = async (app: Gaia.GaiaApplication) => {
  const configPath = path.join(app.appPath, `${APP_CONFIG_PATH}.${app.appType}`);
  const defaultConfig = await getDefaultConfig(app.appPath);
  if (fs.existsSync(configPath)) {
    const customAppConfig = await import(path.join(app.appPath, `${APP_CONFIG_PATH}.${app.appType}`));
    const appConfig: Gaia.GaiaConfig = await customAppConfig.default();
    return merge(defaultConfig, appConfig);
  }
  return defaultConfig;
};
