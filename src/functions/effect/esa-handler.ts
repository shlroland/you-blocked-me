import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";

import * as Scope from "effect/Scope";
// import { MovecarApiLive } from "./movecar/movecar-rpc-live";
// import { MovecarApi } from "./movecar/movecar-rpc";
import * as RpcMiddleware from '@effect/rpc/RpcMiddleware'
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Logger from "effect/Logger";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpServer from "@effect/platform/HttpServer";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Exit from 'effect/Exit'
import * as EsaKVLayer from "./kv/esa";
import * as Cache from "./cache/esa";
import { AmapServiceApiLive } from "./movecar/amap-restful-live";
import { MovecarRpc } from "./movecar/movecar-rpc";
import { MovecarRpcLive } from "./movecar/movecar-rpc-live";
import { AmapServiceApi } from './movecar/amap-restful'


class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()("RpcLogger", {
  wrap: true,
  optional: true,
}) { }


const RpcLoggerLive = Layer.succeed(
  RpcLogger,
  RpcLogger.of((opts) =>
    Effect.flatMap(Effect.exit(opts.next), (exit) =>
      Exit.match(exit, {
        onSuccess: () => exit,
        onFailure: (cause) =>
          Effect.zipRight(
            Effect.annotateLogs(
              Effect.logError(`RPC request failed: ${opts.rpc._tag}`, cause),
              {
                "rpc.method": opts.rpc._tag,
                "rpc.clientId": opts.clientId,
              },
            ),
            exit,
          ),
      }),
    ),
  ),
);

const RpcRouter = RpcServer.layerHttpRouter({
  group: MovecarRpc.middleware(RpcLogger),
  path: "/api/rpc",
  protocol: "http",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(MovecarRpcLive),
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcSerialization.layerNdjson),
).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(EsaKVLayer.layer("you-blocked-me"))
) as Layer.Layer<never, never, HttpLayerRouter.HttpRouter>


// const MovecarApiRouter = HttpLayerRouter.addHttpApi(MovecarApi).pipe(
//   Layer.provide(MovecarApiLive),
//   Layer.provide(HttpServer.layerContext),
//   Layer.provide(EsaKVLayer.layer("you-blocked-me")),

// );


const HttpApiRouter = HttpLayerRouter.addHttpApi(AmapServiceApi).pipe(
  Layer.provide(AmapServiceApiLive),
  Layer.provide(HttpServer.layerContext),
  Layer.provide(Cache.layer),
);

const HealthCheckRouter = HttpLayerRouter.use((router) => {
  return router.add("GET", "/api/health", () => HttpServerResponse.text("ok2"))
})

const AllRoutes = Layer.mergeAll(RpcRouter, HttpApiRouter, HealthCheckRouter).pipe(
  Layer.provide(Logger.pretty),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(HttpLayerRouter.cors()),
)

import { makeWebRuntime } from "./runtime";

const webRuntime = makeWebRuntime(
  Layer.provideMerge(AllRoutes, HttpLayerRouter.layer)
)

const globalHmr = globalThis as unknown as {
  __EFFECT_DISPOSE__?: () => Promise<void>;
};
if (globalHmr.__EFFECT_DISPOSE__) {
  await globalHmr.__EFFECT_DISPOSE__();
  globalHmr.__EFFECT_DISPOSE__ = undefined;
}

globalHmr.__EFFECT_DISPOSE__ = async () => {
  await webRuntime.dispose();
};

export const handler = async (request: Request) => {
  const runtime = await webRuntime.getRuntime()
  const app = Effect.flatMap(HttpLayerRouter.HttpRouter, (router) => router.asHttpEffect()).pipe(
    Effect.provideService(Scope.Scope, webRuntime.scope)
  )
  return webRuntime.runResponse(runtime, app, request)
}
