import * as Layer from "effect/Layer"
import { AllRoutes } from '../../router'
import * as EsaKVLayer from './kv'
import * as EsaCacheLayer from './cache'
import { makeWebRuntime } from "../../runtime";
import { registerHmr } from "../../hmr-register";
import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as ConfigProvider from "effect/ConfigProvider";
import { env } from "./env";

export const Routes = AllRoutes.pipe(
  Layer.provide(EsaKVLayer.layer("you-blocked-me")),
  Layer.provide(EsaCacheLayer.layer)
)

const webRuntime = makeWebRuntime(Routes)

registerHmr(async () => {
  await webRuntime.dispose()
})

export const handler = async (request: Request) => {
  const runtime = await webRuntime.getRuntime()

  const app = Effect.flatMap(HttpLayerRouter.HttpRouter, (router) => router.asHttpEffect()).pipe(
    Effect.provideService(Scope.Scope, webRuntime.scope),
    Effect.withConfigProvider(ConfigProvider.fromJson(env))
  )
  return webRuntime.runResponse(runtime, app, request)
}
