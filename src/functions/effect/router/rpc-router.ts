import * as RpcMiddleware from '@effect/rpc/RpcMiddleware'
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Exit from 'effect/Exit'
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import { MovecarRpc } from '../movecar/movecar-rpc';
import { MovecarRpcLive } from '../movecar/movecar-rpc-live';

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

export const RpcRouter = RpcServer.layerHttpRouter({
  group: MovecarRpc.middleware(RpcLogger),
  path: "/api/rpc",
  protocol: "http",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(MovecarRpcLive),
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(FetchHttpClient.layer),
)
