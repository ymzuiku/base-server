/* eslint-disable prettier/prettier */
// yarn add fastify fastify-static fastify-cors fastify-compress fastify-helmet

import { resolve } from "path";
import {
  fastify,
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import fastifyStatic from "fastify-static";
import fastifyCors from "fastify-cors";
import fastifyCompress from "fastify-compress";
import fastfyHelment from "fastify-helmet";
import { RouteGenericInterface } from "fastify/types/route";
import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";

const pwd = (...args: string[]) => resolve(process.cwd(), ...args);
export type IRequest = FastifyRequest<
RouteGenericInterface,
any,
IncomingMessage | Http2ServerRequest
>;
export type IReply = FastifyReply<any, IncomingMessage | Http2ServerRequest, ServerResponse | Http2ServerResponse, RouteGenericInterface, unknown>


export interface IFastFn {
  body: any;
  params: any;
  headers: any;
  replyHeaders: any;
}

interface IFast extends FastifyInstance<any> {
  POST: (path: string, fn: (req: IFastFn) => any) => any;
  GET: (path: string, fn: (req: IFastFn) => any) => any;
  DEL: (path: string, fn: (req: IFastFn) => any) => any;
  OPTIONS: (path: string, fn: (req: IFastFn) => any) => any;
  ServicePOST: {[url:string]:(req: IFastFn) => any}
  ServiceGET: {[url:string]:(req: IFastFn) => any}
  ServiceDEL: {[url:string]:(req: IFastFn) => any}
  ServiceOPTIONS: {[url:string]:(req: IFastFn) => any}
  Start:(port:number)=>void;
}

export const fast: IFast = fastify({ logger: false }) as any;
fast.ServiceGET = {};
fast.ServicePOST = {};
fast.ServiceDEL = {};
fast.ServiceOPTIONS = {};

fast.GET = (path: string, fn: (req: IFastFn) => any) => {
  fast.ServiceGET[path] = fn;
  fast.get(path, async (req, rep) => {
    const data = await Promise.resolve(
      fn({
        params: req.params || {},
        body: req.query || {},
        headers: req.headers  || {},
        replyHeaders: rep.headers,
      })
    );
    if (!data) {
      return rep.code(400).send({ code: 400, error: "No found data" });
    }
    return rep.code(data.code || 200).send(data);
  });
};


function baseFn(key:string){
  return (path: string, fn: (req: IFastFn) => any) => {
    (fast as any)[`Service${key.toLocaleUpperCase()}`][path] = fn;
    (fast as any)[key](path, async (req:IRequest, rep:IReply) => {
      let body:any;
      try {
        if (req.body) {
          body = JSON.parse(req.body as any);
        } else {
          body = {};
        }
      } catch(err){
        return rep.code(401).send({ code: 400, error: "body parse error" });
      }
      const data = await Promise.resolve(
        fn({
          params: req.params || {},
          body,
          headers: req.headers || {},
          replyHeaders: rep.headers,
        })
      );
      if (!data) {
        return rep.code(500).send({ code: 500, error: "Server no return data" });
      }
      return rep.code(data.code || 200).send(data);
    });
  };
}

fast.POST = baseFn('post');
fast.DEL = baseFn('delete');
fast.OPTIONS = baseFn('options');

// 开发环境打开 cors
if (true) {
  fast.register(fastifyCors);
}

fast.register(fastfyHelment);
fast.register(fastifyCompress);
fast.register(fastifyStatic, {
  root: pwd("./static"),
});

// Run the server!
fast.Start = async (port: number) => {
  try {
    // eslint-disable-next-line no-console
    console.log("server listening: http://0.0.0.0:" + port);
    await fast.listen(port, "0.0.0.0");
  } catch (err) {
    fast.log.error(err);
    process.exit(1);
  }
};
