ALTER TABLE "datalake" ADD COLUMN "metadata" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "datawarehouse" ADD COLUMN "metadata" jsonb NOT NULL;