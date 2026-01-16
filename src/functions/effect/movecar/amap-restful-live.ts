import { HttpApiBuilder, HttpServerResponse } from "@effect/platform";
import { AmapServiceApi } from "./amap-restful";
import { Effect } from "effect";

export const AmapServiceApiLive = HttpApiBuilder.group(
  AmapServiceApi,
  "amap",
  (handlers) =>
    handlers.handle("getAmapService", () => Effect.gen(function* () {

      return HttpServerResponse.text("ok111");
    }))
)
