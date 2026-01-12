import { Hono } from 'hono';
import { env } from 'hono/adapter';

const amapRoute = new Hono().all('/_AMapService/*', async (c) => {
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
  const jscode: any = env(c).AMAP_SECURITY_KEY || '请配置AMAP_SECURITY_KEY环境变量';
  targetUrl.searchParams.append('jscode', jscode);

  // Fetch the target API
  const response = await fetch(targetUrl.toString(), {
    method: c.req.method,
    headers: c.req.header(),
    body: c.req.raw.body
  });

  return response;
});

const appRoute = new Hono().basePath('/api').get('/', (c) => c.text('Hello World'))

export const handler = new Hono().route('/', amapRoute).route('/', appRoute)

export type AppType = typeof handler

