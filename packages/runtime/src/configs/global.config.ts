import { resolve } from "node:path";
import { z } from "zod";

const envSchema = z.object({
  DATA_DIR: z.string().min(1).optional().default("./.datahouse"),
});

const env = envSchema.parse({
  DATA_DIR: process.env.DATA_DIR,
});

export const DATA_DIR = resolve(process.cwd(), env.DATA_DIR);
