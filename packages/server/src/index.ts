import { PORT } from "./configs/core.config";
import { server } from "./server";
import { dbBackend } from "./configs/database.config";
import { setupCronJobs } from "./services/queues.service";

await dbBackend.migrate();
await setupCronJobs();
server.listen(PORT);
console.log(
  `Datahouse server running at ${server.server?.hostname ?? "localhost"}:${server.server?.port}`,
);
