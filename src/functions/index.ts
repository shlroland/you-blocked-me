import { handleNotify, handleGetLocation, handleOwnerConfirmAction, handleCheckStatus } from './api/handlers';
import { handler } from "./effect/esa-handler"

async function handleRequest(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/hello-world') {
    return new Response('Hello World');
  }

  if (path === '/api/notify' && request.method === 'POST') {
    return handleNotify(request, url);
  }

  if (path === '/api/get-location') {
    return handleGetLocation();
  }

  if (path === '/api/owner-confirm' && request.method === 'POST') {
    return handleOwnerConfirmAction(request);
  }

  if (path === '/api/check-status') {
    return handleCheckStatus();
  }

  return new Response('Not Found', { status: 404 });
}



// export { handler as default } from './api/hono';

export default {
  fetch(req: Request, ctx: any) {
    // console.alert("fetch", req.url);
    return handler(req, ctx);
  }
}
