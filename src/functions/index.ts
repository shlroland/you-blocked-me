import { httpApp } from '@effect/platform/HttpApiBuilder';
import { handleNotify, handleGetLocation, handleOwnerConfirmAction, handleCheckStatus } from './api/handlers';
import * as HttpApp from "@effect/platform/HttpApp";
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

HttpApp.toWebHandler

export { default } from './effect/adapator/esa';
