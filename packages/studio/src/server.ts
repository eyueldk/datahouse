import { staticPlugin } from "@elysiajs/static";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Elysia } from "elysia";

function getDistPath() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return resolve(currentDir, "./studio");
}

function getIndexPath() {
  return resolve(getDistPath(), "index.html");
}

export async function startStudio(port: number): Promise<void> {
  const distPath = getDistPath();
  const indexPath = getIndexPath();

  if (!existsSync(indexPath)) {
    throw new Error(
      "Studio assets are missing. Run `bun run build` in packages/studio first.",
    );
  }

  const app = new Elysia({ name: "datahouse-studio" })
    .use(
      await staticPlugin({
        assets: distPath,
        prefix: "/",
        ignorePatterns: [/\.html$/i],
        alwaysStatic: true,
      }),
    )
    .get("/", () => Bun.file(indexPath))
    .get("*", () => Bun.file(indexPath));

  app.listen(port);
}
