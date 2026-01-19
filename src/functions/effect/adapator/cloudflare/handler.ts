import { makeWebRuntime } from "../../runtime";
import { registerHmr } from "../../hmr-register";
import { AllRoutes } from '../../router'
import * as Effect from "effect/Effect"
import * as Runtime from "effect/Runtime"
import * as Layer from "effect/Layer"
import * as Scope from "effect/Scope"
import * as ConfigProvider from "effect/ConfigProvider"
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter"
import { make as makeKV } from "./kv";
import { make as makeCache } from "./cache";
import { KVStore } from "../../kv";
import { Cache } from "../../cache";


const webRuntime = makeWebRuntime(AllRoutes)

registerHmr(async () => {
  await webRuntime.dispose()
})

export const handler = async (request: Request, env: Cloudflare.Env) => {
  // 为每个请求创建包含 env 绑定的 Layer
  const envLayer = Layer.mergeAll(
    Layer.succeed(KVStore, makeKV(env.YOU_BLOCKED_ME)),  // KV Layer
    Layer.succeed(Cache, makeCache((caches as any).default))  // Cache Layer
  )

  // 将 env Layer 提供给 AllRoutes
  const appLayer = AllRoutes.pipe(
    Layer.provide(envLayer)
  )

  // 构建 Runtime
  const runtime = await Layer.toRuntime(appLayer).pipe(
    Scope.extend(webRuntime.scope),
    Effect.runPromise
  )

  console.log('env.SERVER3_SEND_KEY', env.SERVER3_SEND_KEY)

  const app = HttpLayerRouter.HttpRouter.pipe(
    Effect.withConfigProvider(ConfigProvider.fromJson({
      AMAP_SECURITY_KEY: env.AMAP_SECURITY_KEY,
      ENVIRONMENT: env.ENVIRONMENT,
      SERVER3_SEND_KEY: env.SERVER3_SEND_KEY
    })),
    Effect.flatMap((router) => router.asHttpEffect()),
    Effect.provideService(Scope.Scope, webRuntime.scope),
  )

  return webRuntime.runResponse(runtime, app, request)
}
