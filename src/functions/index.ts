import { handleNotify, handleGetLocation, handleOwnerConfirmAction, handleCheckStatus } from './api/handlers';

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

export default {
  async fetch(request: Request) {
    return handleRequest(request);
  }
};
