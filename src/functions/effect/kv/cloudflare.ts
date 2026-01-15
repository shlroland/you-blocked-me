import { type KVNamespace as CFKVNamespace } from '@cloudflare/workers-types'
import { Effect, Layer, Option } from 'effect';
import { mapError, type GetWithMetadataResult, type KVNamespace, type ListKey } from './internal';
import { dual } from 'effect/Function';
import { KVStore } from './internal';

/**
 * @since 1.0.0
 * @category constructors
 */
export const make = <Key extends string = string>(
  kv: CFKVNamespace<Key>,
): KVNamespace<Key> => {
  return {
    get: ((...args: unknown[]) => {
      const [keyOrKeys, typeOrOptions] = args;

      // // Batch operation (array of keys)
      if (Array.isArray(keyOrKeys)) {
        const keys = keyOrKeys;
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
            const result = await kv.get(keys, options ?? type);
            const effectMap = new Map<string, Option.Option<any>>();
            for (const [k, v] of result.entries()) {
              effectMap.set(k, v === null ? Option.none() : Option.some(v));
            }
            return effectMap as ReadonlyMap<string, Option.Option<any>>;
          },
          catch: (error) => mapError(error, "get"),
        });
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
      });
    }) as KVNamespace<Key>["get"],

    list: <Metadata = unknown>(options?: KVNamespaceListOptions) => {
      return Effect.tryPromise({
        try: async () => {
          const result = await kv.list<Metadata>(options);

          const keys: Array<ListKey<Metadata, Key>> = result.keys.map((k) => ({
            name: k.name,
            expiration:
              k.expiration !== undefined
                ? Option.some(k.expiration)
                : Option.none(),
            metadata:
              k.metadata !== undefined
                ? Option.some(k.metadata as Metadata)
                : Option.none(),
          }));

          const cacheStatus: Option.Option<string> =
            result.cacheStatus !== null
              ? Option.some(result.cacheStatus)
              : Option.none();

          if (result.list_complete) {
            return {
              listComplete: true,
              keys,
              cacheStatus,
            } as const;
          } else {
            return {
              listComplete: false,
              keys,
              cursor: result.cursor,
              cacheStatus,
            } as const;
          }
        },
        catch: (error) => mapError(error, "list"),
      });
    },

    put: (key, value, options) => {
      return Effect.tryPromise({
        try: async () => {
          return kv.put(key, value as any, options);
        },
        catch: (error) => mapError(error, "put", key),
      });
    },

    getWithMetadata: ((...args: unknown[]) => {
      const [keyOrKeys, typeOrOptions] = args;

      // Batch operation (array of keys)
      if (Array.isArray(keyOrKeys)) {
        const keys = keyOrKeys;
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
            const result = await kv.getWithMetadata(keys, options ?? type);
            const effectMap = new Map<
              string,
              GetWithMetadataResult<any, any>
            >();
            for (const [k, v] of result.entries()) {
              effectMap.set(k, {
                value: v.value === null ? Option.none() : Option.some(v.value),
                metadata:
                  v.metadata === null ? Option.none() : Option.some(v.metadata),
                cacheStatus:
                  v.cacheStatus === null
                    ? Option.none()
                    : Option.some(v.cacheStatus),
              });
            }
            return effectMap as ReadonlyMap<
              string,
              GetWithMetadataResult<any, any>
            >;
          },
          catch: (error) => mapError(error, "getWithMetadata"),
        });
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
          const result = await kv.getWithMetadata(key, options ?? type);
          return {
            value:
              result.value === null ? Option.none() : Option.some(result.value),
            metadata:
              result.metadata === null
                ? Option.none()
                : Option.some(result.metadata),
            cacheStatus:
              result.cacheStatus === null
                ? Option.none()
                : Option.some(result.cacheStatus),
          };
        },
        catch: (error) => mapError(error, "getWithMetadata", key),
      });
    }) as KVNamespace<Key>["getWithMetadata"],

    delete: (key) => {
      return Effect.tryPromise({
        try: async () => {
          return kv.delete(key);
        },
        catch: (error) => mapError(error, "delete", key),
      });
    },
  };
};

/**
 * @since 1.0.0
 * @category layers
 */
export const layer = (kv: CFKVNamespace): Layer.Layer<KVNamespace> =>
  Layer.succeed(KVStore, make(kv));

/**
 * @since 1.0.0
 * @category combinators
 */
export const withKVNamespace: {
  (
    kv: CFKVNamespace,
  ): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    kv: CFKVNamespace,
  ): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(
    effect: Effect.Effect<A, E, R>,
    kv: CFKVNamespace,
  ): Effect.Effect<A, E, R> => Effect.provideService(effect, KVStore, make(kv)),
);
