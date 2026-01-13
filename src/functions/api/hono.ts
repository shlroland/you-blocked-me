import { Hono } from 'hono';
import { amapRoute } from './amap';
import { app } from "./app";
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';


export const handler = new Hono()
  .use('*', async (c, next) => {
    const { ENVIRONMENT } = env<{ ENVIRONMENT: string }>(c);
    if (ENVIRONMENT === 'development') {
      return cors()(c, next);
    }
    await next();
  })
  .route('/', amapRoute).route('/', app)
