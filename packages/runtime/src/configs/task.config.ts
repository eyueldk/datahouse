import { z } from "zod";
import { createBunqueueBackend } from "../backends/bunqueue.backend";
import type { TaskBackend } from "../lib/task-backend";

const schema = z.object({
  BUNQUEUE_HOST: z.string().trim().min(1).optional(),
  BUNQUEUE_PORT: z
    .string()
    .default("6789")
    .transform((s) => parseInt(s, 10))
    .pipe(z.number().int().positive()),
});

const env = schema.parse({
  BUNQUEUE_HOST: process.env.BUNQUEUE_HOST,
  BUNQUEUE_PORT: process.env.BUNQUEUE_PORT,
});

let taskBackend: TaskBackend;

if (env.BUNQUEUE_HOST) {
  taskBackend = createBunqueueBackend({
    connection: {
      host: env.BUNQUEUE_HOST,
      port: env.BUNQUEUE_PORT,
    },
  });
} else {
  taskBackend = createBunqueueBackend({ embedded: true });
}

export { taskBackend };
