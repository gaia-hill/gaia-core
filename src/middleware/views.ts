import Koa from 'koa';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { VIEW_PATH } from '../constant';
import merge from 'lodash.merge';
import { Gaia } from '../types';

const viewCache = {};

export default (
  appPath: string,
  viewConfig: Gaia.ViewOptions,
) => (
  async (ctx: Gaia.GaiaContext, next: Koa.Next) => {
    ctx.render = (viewName: string, pageData: Gaia.CommonType) => {
      const {
        type = 'ejs', cache = false, data = {}, layout,
      } = { ...viewConfig };

      // 获取渲染模板的路径
      const viewDir = path.join(appPath, VIEW_PATH);
      const viewFilePath = path.join(viewDir, `${viewName}.${type}`);
      let layoutFilePath = '';
      if (layout) {
        layoutFilePath = path.join(viewDir, `${layout}.${type}`);
      }

      // 获取页面需要渲染的数据，data为全局数据，pageData为单个页面的数据
      const renderData = merge({}, data, pageData);

      switch (type) {
        case 'ejs':
        case 'html':
          ctx.body = renderHtmlByEjs(viewFilePath, layoutFilePath, renderData, cache);
          ctx.type = 'html';
          break;

        default:
          ctx.body = '暂不支持当前模板类型';
          ctx.type = 'html';
          break;
      }
    };
    await next();
  }
);

function renderHtmlByEjs(
  viewFilePath: string,
  layoutFilePath: string,
  renderData: Gaia.CommonType,
  cache: boolean,
) {
  const pageHtml = ejsRender(viewFilePath, renderData, cache);
  if (layoutFilePath) {
    if (!fs.existsSync(layoutFilePath)) throw new Error(`模板${layoutFilePath}未找到`);
    const layoutHtml = ejsRender(layoutFilePath, { ...renderData, layout: pageHtml }, cache);
    return layoutHtml;
  }
  return pageHtml;
}

const ejsRender = (filePath: string, data: Gaia.CommonType, cache = false) => {
  if (cache && viewCache[filePath]) {
    return viewCache[filePath](data);
  }
  const tpl = fs.readFileSync(filePath, 'utf8');
  const ejsCompile = ejs.compile(tpl, {
    cache,
    filename: filePath,
  });
  if (cache) viewCache[filePath] = ejsCompile;

  return ejsCompile(data);
};
