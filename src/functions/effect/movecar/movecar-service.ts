import * as Effect from "effect/Effect";
import {
  createRequestNotifyId,
  createOwnerConfirmId,
  NotificationNotFound,
  NotifyId, Server3SendKeyNotFound,
  type NotifyMessageInput,
  CheckStatusEnum,
  AlertableError,
  NotifyStorageData
} from "./movecar-schema";
import { KVStore, KVNamespaceError } from "../kv/internal";
import { env } from "../../env";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import * as Option from "effect/Option";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";

export class MovecarService extends Effect.Service<MovecarService>()(
  "MovecarService", {
  effect: Effect.gen(function* () {
    const kv = yield* KVStore

    const notify = Effect.fn(function* (input: NotifyMessageInput) {
      const { message, location } = input
      const { url } = yield* HttpServerRequest.HttpServerRequest;

      const notifyId = NotifyId.make(crypto.randomUUID())
      let notifyBody = '🚗 挪车请求';
      if (message) notifyBody += `\n💬 留言: ${message}`;

      const storageData = { message }
      if (location && location.lat && location.lng) {
        notifyBody += '\n📍 已附带位置信息，点击查看';
        Object.assign(storageData, {
          lat: location.lat,
          lng: location.lng,
        });
      } else {
        notifyBody += '\n⚠️ 未提供位置信息';
      }

      const requestNotifyId = createRequestNotifyId(notifyId)

      yield* kv.put(requestNotifyId, JSON.stringify(storageData))

      const sendKey = env.SERVER3_SEND_KEY

      if (!sendKey) {
        yield* Effect.fail(new Server3SendKeyNotFound({ id: notifyId }))
      }

      const server3Url = `https://14776.push.ft07.com/send/${sendKey}.send`

      const urlIns = new URL(url)
      const rawConfirmUrl = `${urlIns.origin}/receive?id=${notifyId}`;

      const req = yield* HttpClientRequest.post(server3Url).pipe(
        HttpClientRequest.bodyJson({
          title: '🚗 挪车请求',
          desp: `${notifyBody}\n\n[点击处理](${rawConfirmUrl})`
        })
      ).pipe(
        Effect.catchTag("HttpBodyError", (error) => {
          error.reason._tag
          return Effect.fail(new AlertableError({ cause: error.reason.error, message: `[${error.reason._tag}]: JSON body error` }))
        })
      )

      const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk)
      yield* client.execute(req).pipe(
        Effect.andThen(res => res.json),
        Effect.scoped
      ).pipe(
        Effect.catchTag("RequestError", (error) => {
          return Effect.fail(new AlertableError({ cause: error, message: error.message }))
        }),
        Effect.catchTag("ResponseError", (error) => {
          return Effect.fail(new AlertableError({ cause: error, message: error.message }))
        })
      )
      const ownerConfirmId = createOwnerConfirmId(notifyId)
      yield* kv.put(ownerConfirmId, CheckStatusEnum.Waiting)
    })

    const getNotification = Effect.fn(function* (id: NotifyId) {
      const requestNotifyId = createRequestNotifyId(id)
      const result = yield* kv.get<NotifyStorageData>(requestNotifyId, "json")
      return yield* result.pipe(
        Effect.orElseFail(() => new NotificationNotFound({ id }))
      )
    })

    const confirm = Effect.fn(function* (id: NotifyId) {
      const ownerConfirmId = createOwnerConfirmId(id)
      return yield* kv.put(ownerConfirmId, CheckStatusEnum.Confirmed)
    })

    const checkStatus = Effect.fn(function* (id: NotifyId) {
      const ownerConfirmId = createOwnerConfirmId(id)
      const result = yield* kv.get(ownerConfirmId)
      return Option.isSome(result) ? CheckStatusEnum.Confirmed : CheckStatusEnum.Waiting
    })

    return {
      notify,
      getNotification,
      confirm,
      checkStatus,
    } as const
  })
}) { }
