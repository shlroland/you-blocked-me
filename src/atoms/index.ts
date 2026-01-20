import * as Effect from "effect/Effect";
import { ApiClient } from "../functions/api-client";
import { Atom } from '@effect-atom/atom-react'
import { withAlert } from "../atoms/with-alert";
import { CheckStatusEnum, NotifyId, type NotifyMessageInput } from "../functions/schema";
import * as Schedule from 'effect/Schedule'
import * as Stream from 'effect/Stream'

const rpcClientRuntime = Atom.runtime(ApiClient.Default)

export const notifyActionAtom = rpcClientRuntime.fn(Effect.fn(function* (input: NotifyMessageInput) {
  const { rpcClient } = yield* ApiClient;
  const id = yield* rpcClient.notify({ input })
  return id
}, withAlert({
  whenSuccess: () => "发送成功 ",
})))

export const notifyIdSearchParamAtom = Atom.searchParam('notifyId', {
  schema: NotifyId
})

export const checkStatusAtom = Atom.family((id: NotifyId) => rpcClientRuntime.atom(
  Stream.repeatEffect(
    Effect.flatMap(ApiClient, ({ rpcClient }) => rpcClient.checkStatus({ id }))
  ).pipe(
    Stream.schedule(Schedule.spaced("2 seconds")),
    Stream.takeUntil((status) => status === CheckStatusEnum.Confirmed)
  )
))

export const getNotificationFnAtom = rpcClientRuntime.fn(Effect.fn(function* (id: NotifyId) {
  const { rpcClient } = yield* ApiClient;
  return yield* rpcClient.getNotification({ id });
}));

export const confirmActionAtom = rpcClientRuntime.fn(Effect.fn(function* (id: NotifyId) {
  const { rpcClient } = yield* ApiClient;
  return yield* rpcClient.confirm({ id });
}, withAlert({ whenSuccess: () => "确认成功" })));
