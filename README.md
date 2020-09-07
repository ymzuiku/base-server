# base-server

这是一个使用 fastify 封装的一个基础web服务, 整个工程是一个轻量 ts 工程, 开发环境使用 nodemon, 编译使用 esbuild

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

它们统前端请求参数至body中，并且注册成为 service 到以下对象中:

- fast.ServiceGET
- fast.ServicePOST
- fast.ServiceDEL
- fast.ServiceOPTIONS

这样方便使得我们可以减少抽离 controller 和 service 的工作

### 自动处理返回code

如下例子，我们返回一个 Object，fast 会自动帮我们序列化为前端可解析的json对象，并且将 code 设置为 http statusCode：

```ts
import { fast } from "../tools/fast";

fast.GET("/hello", ({ body }) => {
  return { code: 200, data: body };
});
```

### env 环境

/env
  /env.dev.js (.gitignore已忽略此文件，若需要，本地自行创建，若使用dev环境并且无env.dev.js 文件，会自动使用env.test.js)
  /env.prod.js
  /env.test.js

在编译时，根据环境变量，我们会复制相应的 env/env.dev.js 或者 env/env.prod.js 覆盖 dist/env.js


由于env不太适合使用硬编码，所以使用js引用，方便上线后方便修改env.js:
```js
const env = require('./env.js');
```