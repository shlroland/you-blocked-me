import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import { MovecarRpc } from "./effect/movecar/movecar-rpc";
import * as RpcClient from "@effect/rpc/RpcClient";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";

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
