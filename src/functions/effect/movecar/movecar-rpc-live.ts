import { MovecarRpc } from "./movecar-rpc";
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { MovecarService } from "./movecar-service";

export const MovecarRpcLive = MovecarRpc.toLayer(
  Effect.gen(function* () {
    const movecarService = yield* MovecarService

    return {
      notify: ({ input }) => movecarService.notify(input),
      getNotification: ({ id }) => movecarService.getNotification(id),
      confirm: ({ id }) => movecarService.confirm(id),
      checkStatus: ({ id }) => movecarService.checkStatus(id),
    }
  })
).pipe(Layer.provide(MovecarService.Default));
