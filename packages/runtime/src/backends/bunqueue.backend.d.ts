import type { ConnectionOptions } from "bunqueue/client";
import { type TaskBackend } from "../lib/task-backend";
export type { ConnectionOptions } from "bunqueue/client";
/**
 * How this backend talks to bunqueue: in-process embedded mode or TCP to a server.
 * The same option object is passed to every `Queue` and `Worker` created by `register`.
 */
export type BunqueueBackendOptions = {
    embedded: true;
} | {
    connection: ConnectionOptions;
};
/**
 * {@link TaskBackend} adapter backed by [bunqueue](https://www.npmjs.com/package/bunqueue)
 * (`Queue`, `Worker`, job schedulers). Requires the Bun runtime.
 */
export declare function createBunqueueBackend(options?: BunqueueBackendOptions): TaskBackend;
