# base-server

这是一个使用 fastify 封装的一个基础 web 服务, 整个工程是一个轻量 ts 工程, 开发环境使用 nodemon, 编译使用 esbuild

## Start

开发环境：

```sh
yarn ser
```

编译：

```sh
yarn build:dev
```

```sh
yarn build:test
```

```sh
yarn build:prod
```

## Feature

### 路由封装

fastify 做了一层薄封装，扩展了以下方法:

- fast.GET
- fast.POST
- fast.DEL
- fast.OPTIONS

它们统前端请求参数至 body 中，并且注册成为 service 到以下对象中:

- fast.ServiceGET
- fast.ServicePOST
- fast.ServiceDEL
- fast.ServiceOPTIONS

这样方便使得我们可以减少抽离 controller 和 service 的工作

### 自动处理返回 code

如下例子，我们返回一个 Object，fast 会自动帮我们序列化为前端可解析的 json 对象，并且将 code 设置为 http statusCode：

```ts
import { fast } from "../tools/fast";

fast.GET("/hello", ({ body }) => {
  return { code: 200, data: body };
});
```

### 约定返回三段式

```ts
{
  code: 200|400|401|417|500,
  error?: 'xxxxx', // 若有错误，需要前端显示错误信息，设定error字符串
  message?: 'xxxx', // 若需要前端显示提醒信息，设定message字符串
  data?: {} || [], // data可选，只能是Object或Array
}
```

### env 环境

/env
/env.dev.js (.gitignore 已忽略此文件，若需要，本地自行创建，若使用 dev 环境并且无 env.dev.js 文件，会自动使用 env.test.js)
/env.prod.js
/env.test.js

在编译时，根据环境变量，我们会复制相应的 env/env.dev.js 或者 env/env.prod.js 覆盖 dist/env.js

由于 env 不太适合使用硬编码，所以使用 js 引用，方便上线后方便修改 env.js:

```js
const env = require("./env.js");
```

### static 文件夹

若有需要附带发布的资源文件，放置 static 文件夹中，该文件夹内的资源会在编译时拷贝至 dist

### 单元测试

测试:

```sh
yarn test
```

生成测试覆盖率:

```sh
yarn coverage
```
