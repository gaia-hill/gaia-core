[![npm version](https://img.shields.io/npm/v/gaia-core.svg?style=flat)](https://www.npmjs.com/package/gaia-core)

基于 koa 的 node 服务端框架，规范了路由生成、中间件管理、静态资源解析、模板渲染

## 安装

`npm i gaia-core --save `

如果使用ts开发，需要安装部分第三方库的类型声明，否则类型检查可能会报错：

`npm i --save-dev @types/node @types/koa @types/koa__cors @types/koa-compress @types/koa-mount @types/koa-static"`

## 使用示例

```javascript
import GaiaApp from "gaia-core";
const nodeEnv = process.env.NODE_ENV;
const gaia = new GaiaApp(__dirname, nodeEnv === 'development' ? 'ts' : 'js'); // 如果本地是ts开发，请在此处判断一下
gaia.start().then((server) => {
  server.on('close', () => {});
});
```

## cli工具
为方便项目初始化，可以使用gaia-cli初始化项目:
https://github.com/gaia-hill/gaia-cli


## 项目结构

以 ts 项目为例（js 相同，只不过文件后缀不一样）

```
.
├── configs                        // 必须，配置文件存储目录
│   ├── application.ts             // 必须，项目通用配置
│   ├── rewrite.ts                 // 非必要，路由重定向文件，可匹配部分路径到指定的路由
│   └── routes.ts                  // 当routeType='config'时需要，定义路由配置
├── middleware                     // 非必要，自定义中间件目录
│   └── custom.ts                  // 自定义中间件
├── routes                         // 当routeType='dir'时需要，根据目录结构生成路由
│   ├── api
│   │   ├── test.ts                // 示例，该路径对应的路由为：/api/test
│   └── index.ts                   // 示例，该路径对应的路由为：/
├── views                          // HTML模板存放目录，模板类型目前支持ejs模板
│   └── index.ejs
└── index.ts                       // 项目入口文件
```

## 项目配置

configs/application.ts 中包含通用配置，配置属性如下：

```javascript
//  以下配置除port外，都为非必填
export default async () => {
  return {
    port: 3005,                    // 服务运行的端口，默认3005
    routeType: 'config',           // 路由类型，config:配置文件 | dir:按目录生成，默认config
    static: {                      // 静态资源目录配置，public和staticPath为Gaia的配置，其他属性可参考koa-static的配置
      public: '/public',           // 静态资源访问路径前缀
      staticPath: './static',      // 静态资源目录（相对于启动目录），示例：如果static下面有test.js文件，则访问时的路径为/public/test.js
    },
    cors: false,                   // 跨域配置，参考@koa/cors的配置
		bodyparser: undefined,         // 请求body解析，参考koa-body配置
    compress: undefined,           // 压缩配置，参考koa-compress的配置
    view: {                        // 模板渲染配置
      type: 'ejs',                 // 模板类型，目前只支持ejs
      cache: true,                 // 是否开启模板缓存
      layout: 'layout',            // ejs的公共渲染模板
      data: {                      // 注入ejs模板的公共变量
        test1: 'xxx',
        test2: () => {},
      },
    },
  };
};

```

## 路由管理

### 配置型路由

configs/application.ts中配置routeType='config'，按配置生成不需要遍历文件夹，启动速度要快一些

在configs/routes.ts文件中添加路由配置，格式如下：

```javascript

import { Gaia } from 'gaia-core';
export default async (): Promise<Gaia.RouteType[]> => [
  {
    path: '/api/test',
    method: 'get',
    controller: async (ctx: Gaia.GaiaContext): Promise<string> => {
      ctx.ajax('/test');
      return 'test';
    },
    children: [
      {
        path: '/subtest',
        method: 'get',
        controller: (ctx: Gaia.GaiaContext) => {
          ctx.ajax('/subtest');
        },
      },
    ],
  },
];

```

该配置文件生成的路由为：

/api/test

/api/test/subtest

### 目录生成

configs/application.ts中配置routeType='dir'

路由生成是根据 routes 文件夹下的目录结构生成，例如下面结构：

```
.
├── api
│   ├── common
│   │   └── getData1.ts     // 对应URL：/api/common/getData1
│   └── getData2.ts         // 对应URL：/api/getData2
└── index.ts                // 对应URL：/
```

路由文件中可进行对应的处理，示例：

```javascript
export default async (ctx) => {
  // do something
  ctx.status = 200;
  ctx.body = { code: 0, msg: "success", data: [] };
};
```

## 路由重定向

在某些情况下，需要对路由进行重写（例如单页面应用非跟路由的刷新 404），可以通过 configs/rewrite.ts 配置，匹配是按数组顺序：

form：源路由路径

to：目标路径

break：当匹配到某一项后，是否中断匹配，true：停止匹配并重定向，false：继续匹配，如果后面又匹配到则根据后面的目标路径跳转

```javascript
import { Gaia } from 'gaia-core';
export default ():Gaia.RewriteConfigType[] => {
  const rewriteRules = [
    {
      from: /^(?!\/favicon.ico)(?!\/api)(?!\/static)(?!\/_logout).*?$/,
      to: "/",
      break: true,
    },
  ];
  return rewriteRules;
};
```

## 模板渲染

框架中封装了对 ejs 模板的渲染，在 ctx 中提供了 render 方法，可以渲染 views 目录下的 ejs 模板

示例：假如在 views 目录下有以下模板

```
.
├── common
│   └── list.ejs
├── layout.ejs
└── index.ejs
```

在路由中我们可以直接通过 render 渲染，第一个参数为模板名称，第二个参数为注入模板的变量，

除了可以在 render 方法中注入变量，也可以在 configs/application.ts 中的 view.data 添加公共参数

```javascript
export default async (ctx) => {
  ctx.render("common/list", { data: "xxx" });
};
```

如果在 configs/application.ts 中配置了 view.layout 属性，render 在渲染时会为每个 ejs 模板默认添加公共模板，用法如下：

```javascript
// view.layout = 'layout'

// 路由渲染list模板
export default async (ctx) => {
  ctx.render("common/list");
};
```

layout.ejs 模板如下：

渲染的模板会通过 body 变量注入 layout 模板对应的位置

```ejs
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>layout</title>
</head>
<body>
  <div>公共的部分</div>
  <%- body %>
</body>
</html>
```

## 自定义中间件

在 middleware 目录中可以自定义 koa 中间件，服务在启动时，会读取 middleware 中的文件，将中间件注入 koa 的实例中，示例：

该中间件是给 ctx 定义两个快捷 response 方法，在路由响应时可以直接调用

```javascript
export default async (ctx, next) => {
  ctx.success = (data) => {
    const body = { code: 0, data, msg: "success" };
    ctx.status = 200;
    ctx.body = body;
  };

  ctx.error = (msg: string) => {
    const body = { code: -1, data: {}, msg };
    ctx.status = 200;
    ctx.body = body;
  };
  await next();
};
```

如果对中间件的执行顺序有要求，可以定义中间件的执行优先级，weight属性类型为 number | 'auto' ，当是数字时，越大优先级越高，当是auto时，执行顺序在数字之后，同为auto按遍历目录的顺序，如果直接导出函数（如上），weight默认为auto：

```javascript
import { Next } from 'koa';
import { Gaia } from 'gaia-core';
export default {
  weight: 9,
  run: async (ctx: Gaia.GaiaContext, next: Next) => {
    ctx.success = (data) => {
      const body = { code: 0, data, msg: "success" };
      ctx.status = 200;
      ctx.body = body;
    };
    
    ctx.error = (msg: string) => {
      const body = { code: -1, data: {}, msg };
      ctx.status = 200;
      ctx.body = body;
    };
    await next();
  },
};

```

## 静态资源目录

在 configs/application.ts 添加 static 参数，可配置静态资源访问服务，假设有如下配置：

```javascript
{
  public: '/public',           // 访问前缀
  staticPath: './static',      // 静态资源本地目录，路径相对于项目启动目录，
  maxAge: 30 * 24 * 60 * 60,   // 资源缓存过期时间
}
```

```
.
├── configs
├── middleware
├── routes
├── static
│   └── test.png
├── views
└── index.ts
```

可通过/public/test.png 访问该资源

## 获取koa application实例

获取app实例有两种方式：

1、通过初始化时的gaia实例获取

```javascript
const gaia = new GaiaApp(__dirname, 'ts');
// gaia.app
```

2、通过请求上下文ctx获取

```javascript
import { Gaia } from 'gaia-core';
export default async (ctx: Gaia.GaiaContext) => {
  // ctx.app
};

```
