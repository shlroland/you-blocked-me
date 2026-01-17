import { MovecarApi } from "./movecar-rpc";
import { Effect } from "effect";
import { MovecarService } from "./movecar-service";
import * as Layer from "effect/Layer";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";

export const MovecarApiLive = HttpApiBuilder.group(MovecarApi, "movecar", (handlers) =>
  Effect.gen(function* () {
    const movecarService = yield* MovecarService

    return handlers
      .handle("notify", (input) => movecarService.notify(input.payload))
      .handle("getNotification", (input) => movecarService.getNotification(input.path.id))
      .handle("confirm", (input) => movecarService.confirm(input.path.id))
      .handle("checkStatus", (input) => movecarService.checkStatus(input.path.id))
  })
).pipe(Layer.provide(MovecarService.Default));
