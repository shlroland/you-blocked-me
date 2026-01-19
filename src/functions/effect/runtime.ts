import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Scope from "effect/Scope"
import * as Runtime from "effect/Runtime"
import * as Exit from "effect/Exit"
import * as HttpApp from "@effect/platform/HttpApp"
import * as ServerResponse from "@effect/platform/HttpServerResponse"
import * as ServerRequest from "@effect/platform/HttpServerRequest"
import * as HttpMiddleware from "@effect/platform/HttpMiddleware"

/**
 * Creates a lazy web runtime manager.
 * 
 * This utility allows for:
 * 1. Lazy initialization of the Runtime (only when requested).
 * 2. Caching of the Runtime for subsequent requests (Global Scope).
 * 3. Exposing the Runtime to allow request-level context injection (e.g. Env).
 */
export const makeWebRuntime = <A, E, R = never>(
  layer: Layer.Layer<A, E, R>,
  options?: {
    readonly memoMap?: Layer.MemoMap | undefined
  }
) => {
  // Create a global scope for the runtime
  const scope = Effect.runSync(Scope.make())

  // Cache for the lazy runtime
  let runtimePromise: Promise<Runtime.Runtime<A>> | undefined
  let runtimeCache: Runtime.Runtime<A> | undefined

  // Dispose function to clean up resources
  const dispose = () => Effect.runPromise(Scope.close(scope, Exit.void))

  // Function to get or create the runtime
  const getRuntime = (): Promise<Runtime.Runtime<A>> => {
    if (runtimeCache) {
      return Promise.resolve(runtimeCache)
    }

    if (!runtimePromise) {
      runtimePromise = Effect.gen(function* () {
        const runtime = yield* (options?.memoMap
          ? Layer.toRuntimeWithMemoMap(layer, options.memoMap)
          : Layer.toRuntime(layer))
        return runtime as Runtime.Runtime<A>
      }).pipe(
        Scope.extend(scope),
        (e) => Effect.runPromise(e as Effect.Effect<Runtime.Runtime<A>, E, never>)
      )
    }

    return runtimePromise.then(rt => {
      runtimeCache = rt
      return rt
    })
  }

  // Helper to convert an Effect application to a web response using the runtime
  const runResponse = async <E>(
    runtime: Runtime.Runtime<A>,
    effect: Effect.Effect<ServerResponse.HttpServerResponse, E, A | Scope.Scope | ServerRequest.HttpServerRequest>,
    request: Request,
    middleware?: HttpMiddleware.HttpMiddleware
  ): Promise<Response> => {
    // Convert to web handler logic using the provided runtime
    const handler = HttpApp.toWebHandlerRuntime(runtime)(effect, middleware)
    return handler(request)
  }

  return {
    getRuntime,
    dispose,
    runResponse,
    scope
  } as const
}
