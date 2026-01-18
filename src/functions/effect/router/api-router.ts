import * as Layer from "effect/Layer";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpServer from "@effect/platform/HttpServer";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import { AmapServiceApi } from "../movecar/amap-restful";
import { AmapServiceApiLive } from "../movecar/amap-restful-live";


export const HttpApiRouter = HttpLayerRouter.addHttpApi(AmapServiceApi).pipe(
  Layer.provide(AmapServiceApiLive),
  Layer.provide(HttpServer.layerContext),
);

export const HealthCheckRouter = HttpLayerRouter.use((router) => {
  return router.add("GET", "/api/health", () => HttpServerResponse.text("ok2"))
})
