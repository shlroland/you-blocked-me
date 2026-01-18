import { handler } from "./handler";

export default {
  fetch(req: Request) {
    return handler(req);
  }
}
