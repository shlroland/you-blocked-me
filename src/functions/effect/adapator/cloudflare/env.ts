import * as HttpMiddleware from "@effect/platform/HttpMiddleware"
import * as Effect from "effect/Effect"
import * as ConfigProvider from "effect/ConfigProvider"

export const withEnvMiddleware = (env: Cloudflare.Env) => HttpMiddleware.make((app) =>
  app.pipe(Effect.withConfigProvider(ConfigProvider.fromJson({
    AMAP_SECURITY_KEY: env.AMAP_SECURITY_KEY,
    ENVIRONMENT: env.ENVIRONMENT,
    SERVER3_SEND_KEY: env.SERVER3_SEND_KEY
  })))
)
