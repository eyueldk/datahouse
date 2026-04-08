import { resolve } from "node:path";
import { z } from "zod";
import { createFSBackend } from "../backends/fs.backend";
import { createS3Backend } from "../backends/s3.backend";
import { DATA_DIR } from "./data.config";

const envSchema = z.union([
  z.object({
    S3_ENDPOINT: z.undefined(),
  }),
  z.object({
    S3_ENDPOINT: z.string().min(1),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET: z.string().min(1),
  }),
]);

const env = envSchema.parse({
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_BUCKET: process.env.S3_BUCKET,
});

export const filesBackend =
  env.S3_ENDPOINT === undefined
    ? createFSBackend({
        baseDir: resolve(DATA_DIR, "files"),
      })
    : createS3Backend({
        endpoint: env.S3_ENDPOINT,
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        bucket: env.S3_BUCKET,
      });
