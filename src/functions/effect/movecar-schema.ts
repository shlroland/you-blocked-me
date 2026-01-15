import * as S from 'effect/Schema'
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";

export const NotifyId = S.String.pipe(S.brand('NotifyId'))
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

export const OwnerConfirmInput = S.Struct({
  id: NotifyId,
  location: NullishGeoPoint,
})

export type OwnerConfirmInput = typeof OwnerConfirmInput.Type

export const CheckStatus = S.Literal('waiting', 'confirmed')

export type CheckStatus = typeof CheckStatus.Type

export class NotificationNotFound extends S.TaggedError<NotificationNotFound>()(
  "NotificationNotFound",
  {
    id: NotifyId,
  },
  HttpApiSchema.annotations({ status: 404 }),
) { }
