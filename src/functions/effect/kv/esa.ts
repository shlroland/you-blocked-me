import { Effect, Option, Layer } from "effect";
import { KVStore, KVNotSupportedError } from "./internal";
import { mapError, type KVNamespace } from './internal';
import { dual } from 'effect/Function';


export const make = <Key extends string = string>(
  kv: EdgeKV,
): KVNamespace<Key> => {
  return {
    get: ((...args: unknown[]) => {
      const [keyOrKeys, typeOrOptions] = args;
      if (Array.isArray(keyOrKeys)) {
        return Effect.fail(new KVNotSupportedError({ key: JSON.stringify(keyOrKeys), operation: 'get' }))
      }
      // Single key operation
      const key = keyOrKeys as Key;
      const type =
        typeof typeOrOptions === "string"
          ? typeOrOptions
          : (typeOrOptions as any)?.type;
      const options =
        typeof typeOrOptions === "object" && typeOrOptions !== null
          ? typeOrOptions
          : undefined;

      return Effect.tryPromise({
        try: async () => {
          const result = await kv.get(key, options ?? type);
          return result === null ? Option.none() : Option.some(result);
        },
        catch: (error) => mapError(error, "get", key),
      })
    }) as unknown as KVNamespace<Key>["get"],
    list: (options) => Effect.fail(new KVNotSupportedError({ key: JSON.stringify(options), operation: 'list' })),
    put: (key, value, options) => {
      return Effect.tryPromise({
        try: async () => {
          return kv.put(key, value as any, options);
        },
        catch: (error) => mapError(error, "put", key),
      });
    },
    delete: (key) => {
      return Effect.tryPromise({
        try: async () => {
          return kv.delete(key);
        },
        catch: (error) => mapError(error, "delete", key),
      });
    },
    getWithMetadata: ((...args: unknown[]) => Effect.fail(new KVNotSupportedError({ key: JSON.stringify(args), operation: 'getWithMetadata' }))) as unknown as KVNamespace<Key>["getWithMetadata"],
  }
}

export const layer = (namespace: string): Layer.Layer<KVNamespace<string>> => {
  const kv = new EdgeKV({ namespace })
  return Layer.succeed(KVStore, make(kv))

}
export const withKVNamespace: {
  (
    kv: EdgeKV,
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    kv: EdgeKV,
  ): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    kv: EdgeKV,
  ): Effect.Effect<A, E, R> => Effect.provideService(effect, KVStore, make(kv)),
);
