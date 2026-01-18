import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { AmapProxyError, AmapServiceApi } from "./amap-restful";
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import { env } from "../../env";
import { Cache } from '../cache/internal'

export const AmapServiceApiLive = HttpApiBuilder.group(
  AmapServiceApi,
  "amap",
  (handlers) =>
    handlers.handle("getAmapService", () => Effect.gen(function* () {
      const req = yield* HttpServerRequest.HttpServerRequest
      const url = req.url
      const path = url.replace(/^\/_AMapService/, '');

      const targetUrl = new URL('https://restapi.amap.com' + path);


      const jscode = env.AMAP_SECURITY_KEY || '请配置AMAP_SECURITY_KEY环境变量';
      targetUrl.searchParams.append('jscode', jscode);

      yield* Effect.logInfo(`Requesting AMap API: ${targetUrl.toString()}`)

      const cache = yield* Cache

      const cacheKey = targetUrl.toString()
      let response = (yield* cache.match(cacheKey)).pipe(
        Option.getOrNull
      )

      if (!response) {
        const res = yield* Effect.tryPromise({
          try: () => fetch(targetUrl.toString()),
          catch: (e) => {
            throw new AmapProxyError({ message: Predicate.isError(e) ? e.message : "Unknown error", cause: e })
          }
        })
        response = new Response(res.body, res)
        yield* cache.put(cacheKey, response)
      }

      return response
    }))
)
