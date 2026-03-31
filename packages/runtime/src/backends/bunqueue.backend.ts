import { Queue, Worker } from "bunqueue/client";
import type {
  ConnectionOptions,
  QueueOptions,
  WorkerOptions,
} from "bunqueue/client";
import {
  createQueueBackend,
  type QueueBackend,
  type RegisterQueueParams,
  type RegisteredQueue,
} from "../lib/queue-backend";

export type { ConnectionOptions } from "bunqueue/client";

/** Job name used for both `enqueue` adds and scheduler templates (see bunqueue Queue API). */
const QUEUE_JOB_NAME = "task";

/**
 * How this backend talks to bunqueue: in-process embedded mode or TCP to a server.
 * The same option object is passed to every `Queue` and `Worker` created by `register`.
 */
export type BunqueueBackendOptions =
  | { embedded: true }
  | { connection: ConnectionOptions };

/**
 * {@link QueueBackend} adapter backed by [bunqueue](https://www.npmjs.com/package/bunqueue)
 * (`Queue`, `Worker`, job schedulers). Requires the Bun runtime.
 */
export function createBunqueueBackend(
  options: BunqueueBackendOptions = { embedded: true },
): QueueBackend {
  const clientOptions: QueueOptions & WorkerOptions =
    "connection" in options
      ? { connection: options.connection }
      : { embedded: true };

  return createQueueBackend({
    register<TData, TResult>(
      params: RegisterQueueParams<TData, TResult>,
    ): RegisteredQueue<TData, TResult> {
      const { name, execute } = params;

      const queue = new Queue<TData>(name, { ...clientOptions });
      new Worker<TData, TResult>(
        name,
        async (job) => execute({ data: job.data }),
        { ...clientOptions },
      );

      return {
        async enqueue({ data }) {
          await queue.add(QUEUE_JOB_NAME, data);
        },

        async schedule({ key, cron, data }) {
          await queue.upsertJobScheduler(key, { pattern: cron }, { data });
        },

        async unschedule({ key }) {
          await queue.removeJobScheduler(key);
        },
      };
    },
  });
}
