import { RpcClient, RpcSerialization } from "@effect/rpc";
import { env } from "./env";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { MovecarRpc } from "./effect/movecar/movecar-rpc";

const getBaseUrl = (): string =>
  env.ENVIRONMENT === "production"
    ? window.location.origin
    : "http://localhost:8787";

const RpcConfigLive = RpcClient.layerProtocolHttp({
  url: getBaseUrl() + "/api/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));


export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
  dependencies: [RpcConfigLive, FetchHttpClient.layer],
  scoped: Effect.gen(function* () {
    const rpcClient = yield* RpcClient.make(MovecarRpc);

    return { rpcClient } as const
  }),
}) { }
