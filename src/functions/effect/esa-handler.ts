import { RpcMiddleware } from "@effect/rpc"
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { MovecarRpcLive } from "./movecar/movecar-live";
import { MovecarRpc } from "./movecar/movecar-rpc";
import * as Logger from "effect/Logger";
import {
  FetchHttpClient
} from "@effect/platform";
import * as EsaLayer from "./kv/esa";

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

// Create the RPC server layer
// const RpcLayer = RpcServer.layer(MovecarRpc).pipe(Layer.provide(MovecarRpcLive))


// export const RpcWebHandler = RpcServer.toHttpApp(MovecarRpc)
// // Choose the protocol and serialization format
// const HttpProtocol = RpcServer.layerProtocolHttp({
//   path: "/rpc"
// }).pipe(Layer.provide(RpcSerialization.layerNdjson))

// // Create the main server layer
// const Main = HttpRouter.Default.serve().pipe(
//   Layer.provide(RpcLayer),
//   Layer.provide(HttpProtocol),
//   Layer.provide(BunHttpServer.layer({ port: 3000 }))
// )

// BunRuntime.runMain(Layer.launch(Main))

// const handler = MovecarRpc.middleware(RpcLogger).pipe(
//   RpcServer.toWebHandler({

//   })
// )

const RpcRouter = RpcServer.layerHttpRouter({
  group: MovecarRpc.middleware(RpcLogger),
  path: "/api/rpc",
  protocol: "http",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(Logger.pretty),
  Layer.provide(MovecarRpcLive),
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcSerialization.layerNdjson),
).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(EsaLayer.layer("you-blocked-me"))
) as Layer.Layer<never, never, HttpLayerRouter.HttpRouter>

const { handler, dispose } = HttpLayerRouter.toWebHandler(RpcRouter);

(globalThis as any).__EFFECT_RPC_SERVER_DISPOSE = dispose;

if ((globalThis as any).__EFFECT_RPC_SERVER_DISPOSE) {
  (globalThis as any).__EFFECT_RPC_SERVER_DISPOSE();
}

export {
  handler
}
