import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import { RpcRouter } from "./rpc-router";
import { HealthCheckRouter, HttpApiRouter } from "./api-router";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";

const Routes = Layer.mergeAll(RpcRouter, HttpApiRouter, HealthCheckRouter).pipe(
  Layer.provide(Logger.pretty),
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(HttpLayerRouter.cors()),
  Layer.provideMerge(HttpLayerRouter.layer)
)

const makeAllRoutes = <R, E, RE>(layer: Layer.Layer<R, E, RE>): Layer.Layer<R, E, Exclude<RE, HttpServerRequest.HttpServerRequest>> => layer as any

export const AllRoutes = makeAllRoutes(Routes)
