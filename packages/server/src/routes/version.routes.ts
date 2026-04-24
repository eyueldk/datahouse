import { Elysia, t } from "elysia";
import packagejson from "../../package.json";

const VersionResponse = t.Object({
  version: t.String(),
});

export const versionRoutes = new Elysia({ tags: ["Version"] }).get(
  "/version",
  () => ({ version: packagejson.version }),
  { response: { 200: VersionResponse } },
);
