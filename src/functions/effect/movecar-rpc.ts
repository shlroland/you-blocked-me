import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from 'effect/Schema'
import { CheckStatus, GeoPoint, NotificationNotFound, NotifyId, NotifyMessageInput } from "./movecar-schema";

export class MovecarRpc extends RpcGroup.make(
  Rpc.make('notify', {
    payload: { input: NotifyMessageInput },
    success: S.Void
  }),
  Rpc.make('getNotification', {
    payload: { id: NotifyId },
    success: GeoPoint,
    error: NotificationNotFound
  }),
  Rpc.make('confirm', {
    payload: { id: NotifyId },
    success: S.Void
  }),
  Rpc.make('checkStatus', {
    payload: { id: NotifyId },
    success: CheckStatus,
  })
) { }

MovecarRpc.toLayerHandler
