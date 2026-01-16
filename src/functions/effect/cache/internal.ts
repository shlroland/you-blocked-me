import { Context, Schema } from 'effect';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option'

/**
 * @since 1.0.0
 * @category type id
 */
export const TypeId: unique symbol = Symbol.for(
  "@you-blocked-me/CacheError",
);

export interface CacheQueryOptions {
  ignoreMethod?: boolean;
}

export class Cache413Error extends Schema.TaggedError<Cache413Error>(
  "@you-blocked-me/Cache413Error",
)("Cache413Error", {
  operation: Schema.Literal("put"),
  statusCode: Schema.Literal(413),
}) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: typeof TypeId = TypeId;

  /**
   * @since 1.0.0
   */
  override get message(): string {
    return `Cache 413 error during ${this.operation}: ${this.statusCode}`;
  }
}

const CacheOperations = Schema.Literal("match", "put", "delete");

export class CacheUnknownError extends Schema.TaggedError<CacheUnknownError>(
  "@you-blocked-me/CacheUnknownError",
)("CacheUnknownError", {
  operation: CacheOperations,
  statusCode: Schema.Number.pipe(Schema.optional),
  cause: Schema.Defect,
  reason: Schema.String,
}) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: typeof TypeId = TypeId;

  /**
   * @since 1.0.0
   */
  override get message(): string {
    return `Cache error during ${this.operation}. Reason: ${this.reason}`;
  }
}

export const CacheError = Schema.Union(
  Cache413Error,
  CacheUnknownError,
);

export type CacheError = Cache413Error | CacheUnknownError;

export interface CacheStruct {
  match(key: string, options?: CacheQueryOptions): Effect.Effect<Option.Option<Response>, CacheError>
  put(key: string, value: Response): Effect.Effect<void, CacheError>
  delete(key: string): Effect.Effect<boolean, CacheError>
}

/**
 * @since 1.0.0
 * @category tags
 */
export const Cache = Context.GenericTag<CacheStruct>(
  "@you-blocked-me/Cache",
);
