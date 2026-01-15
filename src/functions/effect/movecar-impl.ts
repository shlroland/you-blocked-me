// import * as Effect from "effect/Effect";
// import * as Layer from "effect/Layer";
// import * as Option from "effect/Option";
// import * as Config from "effect/Config";
// import { MovecarRpc } from "./movecar-rpc";
// import { KVStore } from "./kv";
// import { NotificationNotFound, NotifyId, GeoPoint, CheckStatus } from "./movecar-schema";
// import { generateMapUrls } from "../../utils";

// const makeMovecar = MovecarRpc.toHandlersContext({
//   notify: ({ input }) =>
//     Effect.gen(function* () {
//       const kv = yield* KVStore;
//       const barkUrl = yield* Config.string("BARK_URL").pipe(Config.option, Effect.runSync);

//       const notifyBody = `🚗 挪车请求${input.message ? `\n💬 留言: ${input.message}` : ''}`;

//       if (input.location) {
//         const { lat, lng } = input.location;
//         const urls = generateMapUrls(lat, lng);
//         yield* kv.set("notification:default:location", { lat, lng, ...urls }, 3600).pipe(Effect.orDie);
//       }

//       yield* kv.set("notification:default:status", "waiting", 600).pipe(Effect.orDie);

//       // TODO: Implement Bark notification

//       return void 0;
//     }),

//   getNotification: ({ id }) =>
//     Effect.gen(function* () {
//       const kv = yield* KVStore;
//       const location = yield* kv.getJson<GeoPoint & { lat: number, lng: number }>(`notification:${id}:location`).pipe(Effect.orDie);

//       if (Option.isNone(location)) {
//         return yield* Effect.fail(new NotificationNotFound({ id }));
//       }

//       return location.value;
//     }),

//   confirm: ({ id }) =>
//     Effect.gen(function* () {
//       const kv = yield* KVStore;
//       yield* kv.set(`notification:${id}:status`, "confirmed", 600).pipe(Effect.orDie);
//       return void 0;
//     }),

//   checkStatus: ({ id }) =>
//     Effect.gen(function* () {
//       const kv = yield* KVStore;
//       const status = yield* kv.getString(`notification:${id}:status`).pipe(Effect.orDie);
//       return Option.getOrElse(status, () => "waiting") as CheckStatus;
//     })
// });

// export const MovecarImplemented = MovecarRpc.toLayer(makeMovecar);
