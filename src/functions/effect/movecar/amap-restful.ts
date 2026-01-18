import * as HttpApi from "@effect/platform/HttpApi";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";
import { CacheError } from "../cache";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";

export class AmapProxyError extends Schema.TaggedError<AmapProxyError>()("AmapProxyError", {
  message: Schema.String,
  cause: Schema.Defect,
  status: Schema.optional(Schema.Number)
}, HttpApiSchema.annotations({ status: 502 })) { }

export class AmapServiceApiGroup extends HttpApiGroup.make("amap")
  .add(HttpApiEndpoint.get("getAmapService", "/*")
    .addError(CacheError)
    .addError(AmapProxyError)
    .addSuccess(Schema.instanceOf(Response))
  )
{
}

export class AmapServiceApi extends HttpApi.make("restful").add(AmapServiceApiGroup).prefix("/_AMapService") { }
