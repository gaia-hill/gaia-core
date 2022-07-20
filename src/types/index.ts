import { Options as CorsOptions } from '@koa/cors';
import { IKoaBodyOptions } from 'koa-body';
import { CompressOptions } from 'koa-compress';
import Application, { Next, Context, Request } from 'koa';
import { Options as StaticOriginOptions } from 'koa-static';

export declare namespace Gaia {

  export interface CommonType {
    [key: string]: any;
  }

  /**
   * 环境变量
   */
  export type NodeEnvType =  'development'|'testing'|'production';

  /**
   * koa应用实例，启动时注入到ctx中，并添加部分特有属性
   * @appType 是ts或js项目
   * @appPath 项目的启动路径
   * @nodeEnv nodeEnv的获取是基于NODE_ENV环境变量获取
   */
  export interface GaiaApplication extends Application {
    appType: 'ts' | 'js';
    appPath: string;
  }

  /**
   * 请求的上下文，扩展koa Context
   * @request 扩展的koa的Request
   * @app 扩展的koa的Application
   */
  export interface GaiaContext extends Context {
    request: Request;
    app: GaiaApplication;
    render: (path: string, data: CommonType) => void;
  }

  /**
   * 静态资源配置
   */
  export interface StaticOptions extends StaticOriginOptions {
    public?: string;
    staticPath?: string;
  }

  /**
   * 模板渲染的配置
   * @type 模板类型
   * @cache 是否缓存模板
   * @layout 模板的公共布局
   * @data 模板渲染的数据
   */
  export interface ViewOptions {
    type?: 'ejs' | 'html';
    cache?: boolean;
    layout?: string;
    data?: CommonType;
  }

  /**
   * 应用的配置，主要包括
   * @port 启动端口
   * @routeType 路由类型。config：配置型，dir：目录型
   * @cors 跨域配置
   * @bodyparser koa-bodyparser的配置
   * @compress koa-compress的配置
   * @static 静态资源目录配置
   * @view 渲染模板配置
   */
  export interface GaiaConfig {
    port: number;
    routeType?: 'config' | 'dir';
    cors?: false | CorsOptions;
    bodyparser?: IKoaBodyOptions;
    compress?: CompressOptions;
    static?: StaticOptions;
    view?: ViewOptions;
  }

  /**
   * 路由重定向的配置类型
   * @from 源请求路径
   * @to 重定向的路径
   * @break 匹配后到第一条时，是否继续向下匹配
   */
  export interface RewriteConfigType {
    from: RegExp | string;
    to: string;
    break?: boolean;
  }

  /**
   * 自定义中间件的类型
   * @weight 中间件加载的优先级
   * @run 中间件的逻辑
   */
  export interface CustomMiddlewareType {
    weight: number | 'auto';
    run: (ctx: GaiaContext, next: Next) => void;
  }

  /**
   * 配置型路由的类型
   * @path 路由的路径
   * @method 路由的方法
   * @controller 路由对应的处理方法
   * @children 子路由
   */
  export interface RouteType {
    path: string;
    method?: string;
    controller?: (ctx: GaiaContext) => any;
    children?: RouteType[];
  }
}
