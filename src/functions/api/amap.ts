import { Hono } from "hono";

export const amapRoute = new Hono().all('/_AMapService/*', async (c) => {
  const url = new URL(c.req.url);
  // Strip the base path and service path to get the relative path for target
  // Current URL: /api/_AMapService/v3/weather...
  // Target URL: https://restapi.amap.com/v3/weather...

  // Remove '/api/_AMapService' from the start of the pathname
  const path = url.pathname.replace(/^\/api\/_AMapService/, '');

  const targetUrl = new URL('https://restapi.amap.com' + path);

  // Copy search params
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  // Append jscode (Security Key)
  const jscode = process.env.AMAP_SECURITY_KEY || '请配置AMAP_SECURITY_KEY环境变量';
  console.log('jscode', jscode)
  targetUrl.searchParams.append('jscode', jscode);

  // Use custom global cache
  const cacheKey = new Request(targetUrl.toString(), c.req.raw)
  let response: Response | undefined = undefined
  if (globalThis.cache) {
    response = await globalThis.cache.get(cacheKey)
  }

  if (!response) {
    // Fetch the target API
    response = await fetch(targetUrl.toString(), {
      method: c.req.method,
      headers: c.req.header(),
      body: c.req.raw.body
    });

    // Make response cacheable
    response = new Response(response.body, response)
    response.headers.set('Cache-Control', 'max-age=3600')

    // if (globalThis.cache) {
    //   // Cache the response without blocking
    //   c.executionCtx.waitUntil(globalThis.cache.put(cacheKey, response.clone()))
    // }
  }

  return response;
});
