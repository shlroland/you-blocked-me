import { registerHmr } from "../../hmr-register";
import { AllRoutes } from '../../router'
import * as Effect from "effect/Effect"
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter"
import * as KV from "./kv";
import * as Cache from "./cache";
import * as Layer from "effect/Layer";
import * as HttpApp from "@effect/platform/HttpApp"
import { Cache as _Cache } from "../../cache"
import * as Context from "effect/Context"
import * as HttpMiddleware from "@effect/platform/HttpMiddleware"
import { compose } from "effect/Function";
import { withEnvMiddleware } from "./env";

export const makeRuntimeFactory = (
  memoMap?: Layer.MemoMap | undefined,
): {
  makeRuntime: (env: Cloudflare.Env) => (request: Request, context?: Context.Context<never> | undefined) => Promise<Response>
  dispose: (() => Promise<void>) | undefined
} => {
  let dispose: (() => Promise<void>) | undefined = undefined

  const makeRuntime = (
    env: Cloudflare.Env,
    middleware?: HttpMiddleware.HttpMiddleware | undefined,
  ) => {
    const layer = AllRoutes.pipe(
      Layer.provide(KV.layer(env.YOU_BLOCKED_ME)),
      Layer.provide(Cache.layer((caches as any).default)),
    )

    const { handler, dispose: _dispose } = HttpApp.toWebHandlerLayerWith(layer, {
      toHandler: (r) => Effect.succeed(Context.get(r.context, HttpLayerRouter.HttpRouter).asHttpEffect()),
      middleware: middleware ? compose(middleware, withEnvMiddleware(env)) : withEnvMiddleware(env),
      memoMap,
    })

    dispose = _dispose

    return handler
  }


  return {
    makeRuntime,
    dispose,
  }
}

const { makeRuntime, dispose } = await makeRuntimeFactory()

registerHmr(async () => {
  await dispose?.()
})

export const handler = async (request: Request, env: Cloudflare.Env) => {
  const handler = makeRuntime(env)

  return handler(request)
}
