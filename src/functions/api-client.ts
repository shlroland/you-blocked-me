import { HttpApiClient } from "@effect/platform";
import { env } from "./env";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { MovecarApi } from "./effect/movecar/movecar-rpc";

const getBaseUrl = (): string =>
  import.meta.env.PROD
    ? window.location.origin
    : "http://localhost:8787";

export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
  dependencies: [FetchHttpClient.layer],
  scoped: Effect.gen(function* () {
    const client = yield* HttpApiClient.make(MovecarApi, {
      baseUrl: getBaseUrl()
    });

    return { client } as const
  }),
}) { }
