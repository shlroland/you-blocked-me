import { Cause, Effect } from "effect";
import { ApiClient } from "../functions/api-client";
import { Atom } from '@effect-atom/atom-react'
import { withAlert } from "../atoms/with-alert";
import type { NotifyMessageInput } from "../functions/schema";
import * as Option from "effect/Option";

const rpcClientRuntime = Atom.runtime(ApiClient.Default)

export const notifyActionAtom = rpcClientRuntime.fn(Effect.fn(function* (input: NotifyMessageInput) {
  const { client } = yield* ApiClient;
  return yield* client.movecar.notify({ payload: input })
}, withAlert({
  whenSuccess: () => "🎉 发送成功",
})))
