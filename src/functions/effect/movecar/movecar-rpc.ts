import * as HttpApi from "@effect/platform/HttpApi";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as S from "effect/Schema";
import {
  CheckStatus,
  NotificationNotFound,
  NotifyId,
  NotifyMessageInput,
  AlertableError,
  Server3SendKeyNotFound,
  NotifyStorageData
} from "./movecar-schema";
import { KVNamespaceError } from "../kv/internal";

export class MovecarApi extends HttpApi.make("MovecarApi")
  .add(
    HttpApiGroup.make("movecar")
      .add(
        HttpApiEndpoint.post("notify", "/notify")
          .setPayload(NotifyMessageInput)
          .addSuccess(NotifyId)
          .addError(KVNamespaceError)
          .addError(Server3SendKeyNotFound)
          .addError(AlertableError)
      )
      .add(
        HttpApiEndpoint.get("getNotification", "/notification/:id")
          .setPath(
            S.Struct({
              id: NotifyId
            })
          )
          .addSuccess(NotifyStorageData)
          .addError(NotificationNotFound)
          .addError(KVNamespaceError)
      )
      .add(
        HttpApiEndpoint.post("confirm", "/notification/:id/confirm")
          .setPath(
            S.Struct({
              id: NotifyId
            })
          )
          .addSuccess(S.Void)
          .addError(KVNamespaceError)
      )
      .add(
        HttpApiEndpoint.get("checkStatus", "/notification/:id/status")
          .setPath(
            S.Struct({
              id: NotifyId
            })
          )
          .addSuccess(CheckStatus)
          .addError(KVNamespaceError)
      )
  )
{ }
