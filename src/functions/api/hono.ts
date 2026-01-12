import { Hono } from 'hono';

const app = new Hono().basePath('/api');

export const handler = app.get('/', (c) => c.text('Hello World'));
