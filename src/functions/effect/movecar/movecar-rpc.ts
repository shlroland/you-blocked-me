import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from 'effect/Schema'
import {
  CheckStatus, NotificationNotFound, NotifyId,
  NotifyMessageInput, AlertableError, Server3SendKeyNotFound, NotifyStorageData
} from "./movecar-schema";
import { KVNamespaceError } from "../kv";


export class MovecarRpc extends RpcGroup.make(
  Rpc.make('notify', {
    payload: { input: NotifyMessageInput },
    success: NotifyId,
    error: S.Union(KVNamespaceError, Server3SendKeyNotFound, AlertableError)
  }),
  Rpc.make('getNotification', {
    payload: { id: NotifyId },
    success: NotifyStorageData,
    error: S.Union(NotificationNotFound, KVNamespaceError)
  }),
  Rpc.make('confirm', {
    payload: { id: NotifyId },
    success: S.Void,
    error: KVNamespaceError
  }),
  Rpc.make('checkStatus', {
    payload: { id: NotifyId },
    success: CheckStatus,
    error: KVNamespaceError
  })
) { }
