import { hc } from 'hono/client';
import type { AppType } from './functions/api/app';

// The base URL should be adjusted based on environment if needed, likely handled by relative path or env var.
// For now, assuming relative path for simplicity or window.location.origin if running in browser.
// If purely client-side, relative path '/api' works if served from same origin.
// However, hc expects a URL.
// Since we are running in Astro, and this code runs on client, we can point to current origin.

export const client = hc<AppType>(import.meta.env.DEV ? 'http://localhost:8787' : '/');
