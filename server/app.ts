import "./tools/global-node-fetch";
import { fast } from "./tools/fast";
import "./controllers";


console.log(require('./env.js'));

fast.Start(4200);
