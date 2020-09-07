import "./tools/global-node-fetch";
import { fast } from "./tools/fast";
import "./controllers";

console.log(require("./env.js"));

// 开发环境打开 cors
fast.useCors();
fast.Start(4200);
