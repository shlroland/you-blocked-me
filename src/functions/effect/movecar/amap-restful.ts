import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

export class AmapServiceApiGroup extends HttpApiGroup.make("amap")
  .add(HttpApiEndpoint.get("getAmapService", "/"))
{
}

export class AmapServiceApi extends HttpApi.make("restful").add(AmapServiceApiGroup) { }
