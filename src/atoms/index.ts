import { Effect } from "effect";
import { ApiClient } from "../functions/api-client";
import { Atom } from '@effect-atom/atom-react'
import { withAlert } from "../atoms/with-alert";
import { CheckStatusEnum, NotifyId, type NotifyMessageInput } from "../functions/schema";
import * as Option from 'effect/Option'
import * as Data from 'effect/Data'
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
