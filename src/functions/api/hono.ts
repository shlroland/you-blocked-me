import { Hono } from 'hono';
import { amapRoute } from './amap';

const appRoute = new Hono().basePath('/api').get('/', (c) => c.text('Hello World'))

export const handler = new Hono().route('/', amapRoute).route('/', appRoute)

export type AppType = typeof handler

