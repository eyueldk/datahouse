ALTER TABLE "datalake" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "datawarehouse" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;