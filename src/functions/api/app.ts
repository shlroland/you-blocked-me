import { Hono, type Context } from 'hono';
import { sValidator } from '@hono/standard-validator';
import { type } from 'arktype';
import { generateMapUrls } from '../../utils';
import { env } from 'hono/adapter';

declare const BARK_URL: string;
declare const PHONE_NUMBER: string;

const CONFIG = { KV_TTL: 3600 };

// Helper to access KV
class MockEdgeKV {
  private static store = new Map<string, any>();

  constructor(options: { namespace: string }) { }

  async get(key: string, options: { type: 'text' | 'json' } = { type: 'text' }) {
    const value = MockEdgeKV.store.get(key);
    if (!value) return null;
    if (options.type === 'json') {
      return JSON.parse(value);
    }
    return value;
  }

  async put(key: string, value: string, options?: any) {
    MockEdgeKV.store.set(key, value);
  }

  async delete(key: string) {
    MockEdgeKV.store.delete(key);
  }
}

let kvInstance: EdgeKV | null = null;

const getKV = (c: Context) => {
  if (kvInstance) return kvInstance;

  if (env(c).ENVIRONMENT === 'development') {
    kvInstance = new MockEdgeKV({ namespace: "kv" }) as unknown as EdgeKV;
  } else {
    kvInstance = new EdgeKV({ namespace: "kv" });
  }

  return kvInstance;
};


// Schemas
const NotifySchema = type({
  "message?": "string",
  "location?": {
    lat: "number",
    lng: "number"
  },
  "delayed?": "boolean"
});

const OwnerConfirmSchema = type({
  id: "string",
  "location?": {
    lat: "number",
    lng: "number"
  }
});

// Routes
export const app = new Hono().basePath('/api').get("/hello", c => c.text('hello world'))
  .post('/notify', sValidator('json', NotifySchema), async (c) => {
    try {
      const body = c.req.valid('json');
      const message = body.message || '车旁有人等待';
      const location = body.location;
      const delayed = body.delayed || false;

      // Construct the confirm URL relative to the current origin
      const url = new URL(c.req.url);
      const uuid = crypto.randomUUID();
      // const confirmUrl = encodeURIComponent(url.origin + '/owner-confirm');

      let notifyBody = '🚗 挪车请求';
      if (message) notifyBody += `\n💬 留言: ${message}`;

      const kv = getKV(c);

      if (location && location.lat && location.lng) {
        const urls = generateMapUrls(location.lat, location.lng);
        notifyBody += '\n📍 已附带位置信息，点击查看';

        await kv.put(`req_loc_${uuid}`, JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          ...urls
        }), { expirationTtl: CONFIG.KV_TTL });
      } else {
        notifyBody += '\n⚠️ 未提供位置信息';
      }

      await kv.put(`status_${uuid}`, 'waiting', { expirationTtl: 600 });

      // 如果是延迟发送，等待30秒
      if (delayed) {
        await new Promise(resolve => setTimeout(resolve, 30000));
      }

      const sendKey = env(c).SERVER3_SEND_KEY

      if (!sendKey) {
        return c.json({ success: false, error: 'SERVER3_SEND_KEY is not defined' }, 500);
      }

      const server3Url = `https://14776.push.ft07.com/send/${sendKey}.send`

      // const barkApiUrl = `${BARK_URL}/挪车请求/${encodeURIComponent(notifyBody)}?group=MoveCar&level=critical&call=1&sound=minuet&icon=https://cdn-icons-png.flaticon.com/512/741/741407.png&url=${confirmUrl}`;

      // const barkResponse = await fetch(barkApiUrl);
      // if (!barkResponse.ok) throw new Error('Bark API Error');

      const rawConfirmUrl = `${url.origin}/receive?id=${uuid}`;

      const response = await fetch(server3Url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: '🚗 挪车请求',
          desp: `${notifyBody}\n\n[点击处理](${rawConfirmUrl})`
        })
      });

      console.log('回复者的url', rawConfirmUrl)

      if (!response.ok) {
        console.error('Server3 Push Error', await response.text());
      }

      return c.json({ success: true, requestId: uuid });
    } catch (error: any) {
      console.log(error)
      return c.json({ success: false, error: error.message }, 500);
    }
  })
  .get('/get-location', async (c) => {
    const id = c.req.query('id');
    if (!id) return c.json({ error: 'Missing id' }, 400);
    const kv = getKV(c);
    const data = await kv.get(`req_loc_${id}`, { type: 'json' });
    if (data) {
      return c.json(data);
    }
    return c.json({ error: 'No location' }, 404);
  })
  .post('/owner-confirm', sValidator('json', OwnerConfirmSchema), async (c) => {
    const body = c.req.valid('json');
    const { id, location: ownerLocation } = body;

    try {
      const kv = getKV(c);

      if (ownerLocation) {
        const urls = generateMapUrls(ownerLocation.lat, ownerLocation.lng);
        await kv.put(`owner_loc_${id}`, JSON.stringify({
          lat: ownerLocation.lat,
          lng: ownerLocation.lng,
          ...urls,
          timestamp: Date.now()
        }), { expirationTtl: CONFIG.KV_TTL });
      }

      await kv.put(`status_${id}`, 'confirmed', { expirationTtl: 600 });
      return c.json({ success: true });
    } catch (error) {
      // Even if error, try to set confirmed
      if (id) {
        try {
          const kv = getKV(c);
          await kv.put(`status_${id}`, 'confirmed', { expirationTtl: 600 });
        } catch (e) { }
      }
      return c.json({ success: true });
    }
  })
  .get('/check-status', async (c) => {
    const id = c.req.query('id');
    if (!id) return c.json({ status: 'unknown' });
    const kv = getKV(c);
    const status = await kv.get(`status_${id}`, { type: 'text' });
    const ownerLocationStr = await kv.get(`owner_loc_${id}`, { type: 'text' });

    return c.json({
      status: status || 'waiting',
      ownerLocation: ownerLocationStr ? JSON.parse(ownerLocationStr) : null
    });

  });

export type AppType = typeof app;

