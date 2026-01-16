import * as S from 'effect/Schema'
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
// import * as HttpApiSchema from "@effect/platform/Http";

export const NotifyId = S.UUID.pipe(S.brand('NotifyId'))
export type NotifyId = typeof NotifyId.Type

export const GeoPoint = S.Struct({
  lat: S.Number,
  lng: S.Number,
})

export type GeoPoint = typeof GeoPoint.Type

const NullishGeoPoint = GeoPoint.pipe(S.NullOr).pipe(S.optionalWith({ default: () => null }))

export const NotifyMessageInput = S.Struct({
  message: S.String,
  location: NullishGeoPoint,
})

export type NotifyMessageInput = typeof NotifyMessageInput.Type

export const NotifyStorageData = S.Struct({
  message: S.String,
  location: NullishGeoPoint,
})

export type NotifyStorageData = typeof NotifyStorageData.Type

export const OwnerConfirmInput = S.Struct({
  id: NotifyId,
  location: NullishGeoPoint,
})

export type OwnerConfirmInput = typeof OwnerConfirmInput.Type

export enum CheckStatusEnum {
  Waiting = "waiting",
  Confirmed = "confirmed"
}

export const CheckStatus = S.Enums(CheckStatusEnum)

export type CheckStatus = typeof CheckStatus.Type

export class NotificationNotFound extends S.TaggedError<NotificationNotFound>()(
  "NotificationNotFound",
  {
    id: NotifyId,
  },
  HttpApiSchema.annotations({ status: 404, description: "Notification not found" }),
) { }

export class Server3SendKeyNotFound extends S.TaggedError<Server3SendKeyNotFound>()(
  "Server3SendKeyNotFound",
  {
    id: NotifyId,
  },
  HttpApiSchema.annotations({ status: 500, description: "Server configuration error: SERVER3_SEND_KEY not found" }),
) { }

export class AlertableError extends S.TaggedError<AlertableError>()(
  "AlertableError",
  {
    cause: S.Defect,
    message: S.String,
  },
) { }

export const createRequestNotifyId = (notifyId: NotifyId) => `req-notify-${notifyId}`
export const createOwnerConfirmId = (notifyId: NotifyId) => `confirm-${notifyId}`

