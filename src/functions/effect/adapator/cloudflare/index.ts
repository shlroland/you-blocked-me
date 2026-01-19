import { handler } from "./handler";

export default {
  fetch(req: Request, env: Cloudflare.Env) {
    return handler(req, env);
  }
}
