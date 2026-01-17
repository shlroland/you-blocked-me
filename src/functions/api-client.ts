import { HttpApiClient } from "@effect/platform";
import { env } from "./env";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { MovecarRpc } from "./effect/movecar/movecar-rpc";
import { RpcClient, RpcSerialization } from "@effect/rpc";

// const getBaseUrl = (): string =>
//   import.meta.env.PROD
//     ? window.location.origin
//     : "http://localhost:8787";

// export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
//   dependencies: [FetchHttpClient.layer],
//   scoped: Effect.gen(function* () {
//     const client = yield* HttpApiClient.make(MovecarApi, {
//       baseUrl: getBaseUrl()
//     });

//     return { client } as const
//   }),
// }) { }

const getBaseUrl = (): string =>
  import.meta.env.PROD
    ? window.location.origin
    : "http://localhost:8787";

const RpcConfigLive = RpcClient.layerProtocolHttp({
  url: getBaseUrl() + "/api/rpc",
}).pipe(Layer.provide([FetchHttpClient.layer, RpcSerialization.layerNdjson]));

export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
  dependencies: [FetchHttpClient.layer, RpcConfigLive],
  scoped: Effect.gen(function* () {
    const rpcClient = yield* RpcClient.make(MovecarRpc);

    // const client = yield* HttpApiClient.make(MovecarApi, {
    //   baseUrl: getBaseUrl()
    // });

    return { rpcClient } as const
  }),
}) { }
