import type { CacheStruct, CacheQueryOptions } from "../../cache";
import { CacheStorage, Cache as CFCache } from '@cloudflare/workers-types'
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { dual } from "effect/Function";
import { CacheUnknownError, Cache413Error, Cache } from '../../cache';
import { isError } from "effect/Predicate";
import * as Layer from "effect/Layer";

export const make = (cache: CFCache): CacheStruct => {
  return {
    match: (key: string, options?: CacheQueryOptions) => {
      return Effect.tryPromise({
        try: async () => {
          const response = (await cache.match(key, options)) as Response | undefined
          const result = Option.fromNullable(response);
          return result;
        },
        catch: (error) => new CacheUnknownError({
          operation: "match",
          cause: error,
          reason: "Unknown error",
        }),
      });
    },
    put: (key: string, value: Response) => {
      return Effect.tryPromise({
        try: async () => {
          return cache.put(key, value as any);
        },
        catch: (error) => {
          if (isError(error)) {
            if ((error as any)?.status === 413) {
              return new Cache413Error({
                operation: "put",
                statusCode: 413,
              })
            }
          }
          return new CacheUnknownError({
            operation: "put",
            cause: error,
            reason: "Unknown error",
          })
        },
      });
    },
    delete: (key: string) => {
      return Effect.tryPromise({
        try: async () => {
          return cache.delete(key);
        },
        catch: (error) => {
          return new CacheUnknownError({
            operation: "delete",
            cause: error,
            reason: "Unknown error",
          })
        },
      });
    },
  };
}



/**
 * @since 1.0.0
 * @category layers
 */
export const layer = (cacheName?: string): Layer.Layer<CacheStruct> => Layer.effect(Cache,
  Effect.gen(function* () {
    const cache = yield*
      Effect.tryPromise({
        try: () => cacheName
          ? caches.open(cacheName).then(c => c as unknown as CFCache)
          : Promise.resolve((caches as unknown as CacheStorage).default),
        catch: (error) => new CacheUnknownError({
          operation: "open",
          cause: error,
          reason: "Unknown error",
        }),
      }).pipe(Effect.orDie);

    return make(cache);
  }))

/**
 * @since 1.0.0
 * @category combinators
 */
export const withCache: {
  (
    cache: CFCache,
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    cache: CFCache,
  ): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    cache: CFCache,
  ): Effect.Effect<A, E, R> => Effect.provideService(effect, Cache, make(cache)),
);
