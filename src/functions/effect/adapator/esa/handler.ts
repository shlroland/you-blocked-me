import * as Layer from "effect/Layer"
import { AllRoutes } from '../../router'
import * as EsaKVLayer from './kv'
import * as EsaCacheLayer from './cache'
import { registerHmr } from "../../hmr-register";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import { envMiddleware } from "./env";

export const Routes = AllRoutes.pipe(
  Layer.provide(EsaKVLayer.layer("you-blocked-me")),
  Layer.provide(EsaCacheLayer.layer)
)

const { handler, dispose } = HttpLayerRouter.toWebHandler(Routes, {
  middleware: envMiddleware
})

registerHmr(async () => {
  await dispose()
})

export {
  handler
}
