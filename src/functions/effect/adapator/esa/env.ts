import * as HttpMiddleware from "@effect/platform/HttpMiddleware"
import * as Effect from "effect/Effect"
import * as ConfigProvider from "effect/ConfigProvider"

declare const __WILL_REPLACE_AMAP_SECURITY_KEY: string;
declare const __WILL_REPLACE_SERVER3_SEND_KEY: string;
declare const __WILL_REPLACE_ENVIRONMENT: string;

export const env = {
  AMAP_SECURITY_KEY: typeof __WILL_REPLACE_AMAP_SECURITY_KEY !== 'undefined' ? __WILL_REPLACE_AMAP_SECURITY_KEY : '',
  SERVER3_SEND_KEY: typeof __WILL_REPLACE_SERVER3_SEND_KEY !== 'undefined' ? __WILL_REPLACE_SERVER3_SEND_KEY : '',
  ENVIRONMENT: typeof __WILL_REPLACE_ENVIRONMENT !== 'undefined' ? __WILL_REPLACE_ENVIRONMENT : 'production',
}

export const envMiddleware = HttpMiddleware.make((app) =>
  app.pipe(Effect.withConfigProvider(ConfigProvider.fromJson(env)))
)
