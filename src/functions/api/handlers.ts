import { generateMapUrls } from '../../utils';

const CONFIG = { KV_TTL: 3600 };
// Assuming these are injected globals or environment variables. 
// If they are environment variables passed to fetch, we needs to adjust the architecture to pass 'env'.
// For now, adhering to the requested extraction based on the provided global declarations context.
declare const BARK_URL: string;
declare const PHONE_NUMBER: string;

// Helper to access KV. 
// The user's index.ts showed `new EdgeKV({ namespace: "kv" })`.
// We will use that pattern.
const getKV = () => new EdgeKV({ namespace: "kv" });

export async function handleNotify(request: Request, url: URL) {
  try {
    const body: any = await request.json();
    const message = body.message || '车旁有人等待';
    const location = body.location || null;
    const delayed = body.delayed || false;

    const confirmUrl = encodeURIComponent(url.origin + '/owner-confirm');

    let notifyBody = '🚗 挪车请求';
    if (message) notifyBody += `\n💬 留言: ${message}`;

    const kv = getKV();

    if (location && location.lat && location.lng) {
      const urls = generateMapUrls(location.lat, location.lng);
      notifyBody += '\n📍 已附带位置信息，点击查看';

      await kv.put('requester_location', JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        ...urls
      }), { expirationTtl: CONFIG.KV_TTL });
    } else {
      notifyBody += '\n⚠️ 未提供位置信息';
    }

    await kv.put('notify_status', 'waiting', { expirationTtl: 600 });

    // 如果是延迟发送，等待30秒
    if (delayed) {
      await new Promise(resolve => setTimeout(resolve, 30000));
    }

    // Using BARK_URL global. If it's undefined at runtime, this will throw.
    // Ideally this should be passed from env.
    const barkApiUrl = `${BARK_URL}/挪车请求/${encodeURIComponent(notifyBody)}?group=MoveCar&level=critical&call=1&sound=minuet&icon=https://cdn-icons-png.flaticon.com/512/741/741407.png&url=${confirmUrl}`;

    const barkResponse = await fetch(barkApiUrl);
    if (!barkResponse.ok) throw new Error('Bark API Error');

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}

export async function handleGetLocation() {
  const kv = getKV();
  const data = await kv.get('requester_location', { type: 'json' });
  if (data) {
    // EdgeKV.get with 'json' returns the object directly
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ error: 'No location' }), { status: 404 });
}

export async function handleOwnerConfirmAction(request: Request) {
  try {
    const body: any = await request.json();
    const ownerLocation = body.location || null;
    const kv = getKV();

    if (ownerLocation) {
      const urls = generateMapUrls(ownerLocation.lat, ownerLocation.lng);
      await kv.put('owner_location', JSON.stringify({
        lat: ownerLocation.lat,
        lng: ownerLocation.lng,
        ...urls,
        timestamp: Date.now()
      }), { expirationTtl: CONFIG.KV_TTL });
    }

    await kv.put('notify_status', 'confirmed', { expirationTtl: 600 });
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Even if error, try to set confirmed? Original code did this in catch block too.
    const kv = getKV();
    await kv.put('notify_status', 'confirmed', { expirationTtl: 600 });
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function handleCheckStatus() {
  const kv = getKV();
  const status = await kv.get('notify_status', { type: 'text' });
  const ownerLocationStr = await kv.get('owner_location', { type: 'text' });

  return new Response(JSON.stringify({
    status: status || 'waiting',
    ownerLocation: ownerLocationStr ? JSON.parse(ownerLocationStr) : null
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
