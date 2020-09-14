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

export type IRequest = FastifyRequest<
  RouteGenericInterface,
  any,
  IncomingMessage | Http2ServerRequest
>;

export type IReply = FastifyReply<
  any,
  IncomingMessage | Http2ServerRequest,
  ServerResponse | Http2ServerResponse,
  RouteGenericInterface,
  unknown
>;

interface HeaderTypes {
  "Access-Control-Allow-Methods"?: string;
  "Access-Control-Allow-Credentials"?: string;
  "Access-Control-Allow-Origin"?: string;
  "Content-type"?: string;
  "Content-disposition"?: "attachment;filename=dog.zip";
  [key: string]: any;
}

interface IFastFnHeaders {
  setHeaders: (value: HeaderTypes) => any;
  setFileHeaders: (name: string) => any;
  params: any;
  headers: any;
}

export interface IFastFn extends IFastFnHeaders {
  body: any;
}

export interface IFastServiceFn {
  body?: any;
  params?: any;
  headers?: any;
  setHeaders?: (value: HeaderTypes) => any;
}

interface IFast extends FastifyInstance<any> {
  POST: (path: string, fn: (req: IFastFn) => any) => any;
  GET: (path: string, fn: (req: IFastFn) => any) => any;
  DEL: (path: string, fn: (req: IFastFn) => any) => any;
  OPTIONS: (path: string, fn: (req: IFastFn) => any) => any;
  ServicePOST: { [url: string]: (req: IFastServiceFn) => any };
  ServiceGET: { [url: string]: (req: IFastServiceFn) => any };
  ServiceDEL: { [url: string]: (req: IFastServiceFn) => any };
  ServiceOPTIONS: { [url: string]: (req: IFastServiceFn) => any };
  Start: (port: number) => void;
  useCors: () => any;
  useStatic: () => any;
}

export const fast: IFast = fastify({ logger: false }) as any;
fast.ServiceGET = {};
fast.ServicePOST = {};
fast.ServiceDEL = {};
fast.ServiceOPTIONS = {};

fast.GET = (path: string, fn: (req: IFastFn) => any) => {
  fast.ServiceGET[path] = fn as any;
  fast.get(path, async (request, reply) => {
    const data = await Promise.resolve(
      fn({
        ...makeHeaderHelper(request, reply),
        body: request.query || {},
      })
    );
    if (!data) {
      return reply.code(400).send({ code: 400, error: "No found data" });
    }
    return reply.code(data.code || 200).send(data);
  });
};

function makeHeaderHelper(request: IRequest, reply: IReply): IFastFnHeaders {
  return {
    params: request.params || {},
    headers: request.headers || {},
    setHeaders: (v: any) => reply.headers(v),
    setFileHeaders: (name: string) => {
      reply.headers({
        "Content-disposition": `attachment;filename=${name}` as any,
        "Content-type": "application/text",
      });
    },
  };
}

function baseFn(key: string) {
  return (path: string, fn: (req: IFastFn) => any) => {
    (fast as any)[`Service${key.toLocaleUpperCase()}`][path] = fn;
    (fast as any)[key](path, async (request: IRequest, reply: IReply) => {
      let body: any;
      try {
        if (request.body) {
          body = JSON.parse(request.body as any);
        } else {
          body = {};
        }
      } catch (err) {
        return reply.code(401).send({ code: 400, error: "body parse error" });
      }
      reply.headers({ aa: "bb" });
      const data = await Promise.resolve(
        fn({
          ...makeHeaderHelper(request, reply),
          body,
        })
      );
      if (!data) {
        return reply
          .code(500)
          .send({ code: 500, error: "Server no return data" });
      }
      return reply.code(data.code || 200).send(data);
    });
  };
}

fast.POST = baseFn("post");
fast.DEL = baseFn("delete");
fast.OPTIONS = baseFn("options");

fast.useCors = () => {
  fast.register(fastifyCors);
};

fast.register(fastfyHelment);
fast.register(fastifyCompress);
fast.useStatic = () => {
  fast.register(fastifyStatic, {
    root: resolve(__dirname, "./view"),
  });
};

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
