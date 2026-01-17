import { Registry } from "@effect-atom/atom-react";
import * as Cause from "effect/Cause";
import * as Option from "effect/Option";
import * as Effect from "effect/Effect";
import { isFunction } from "effect/Predicate";

type AlertOptions<A, E, Args extends ReadonlyArray<unknown>> = {
  whenLoading?:
  | string
  | ((args: { registry: Registry.Registry; args: Args }) => string);
  whenSuccess?:
  | string
  | ((args: { registry: Registry.Registry; result: A; args: Args }) => string);
  whenFailure?:
  | string
  | ((args: {
    registry: Registry.Registry;
    cause: Cause.Cause<E>;
    args: Args;
  }) => Option.Option<string>);
};

export const withAlert =
  <A, E, Args extends ReadonlyArray<unknown>, R>(options: AlertOptions<A, E, Args>) =>
    (self: Effect.Effect<A, E, R>, ...args: Args) =>
      Effect.gen(function* () {
        const registry = yield* Registry.AtomRegistry;
        const loading = isFunction(options.whenLoading)
          ? options.whenLoading({ registry, args })
          : options.whenLoading;

        if (loading) {
          yield* Effect.sync(() => {
            window.alert(loading);
          })
        }

        const result = yield* self.pipe(
          Effect.tapErrorCause((cause) => {
            return Effect.sync(() => {
              const _message = isFunction(options.whenFailure)
                ? options.whenFailure({ registry, cause, args })
                : options.whenFailure;

              if (!_message || (Option.isOption(_message) && Option.isNone(_message))) {
                return
              }

              const message = Option.isOption(_message)
                ? _message.value
                : _message

              window.alert(message)

              return
            })
          })
        )

        const success = isFunction(options.whenSuccess)
          ? options.whenSuccess({ registry, result, args })
          : options.whenSuccess;

        if (success) {
          yield* Effect.sync(() => {
            window.alert(success);
          })
        }

        return result
      })
