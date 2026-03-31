CREATE TABLE "datalake" (
	"id" varchar PRIMARY KEY NOT NULL,
	"run_id" varchar NOT NULL,
	"source_id" varchar NOT NULL,
	"extractor_id" text NOT NULL,
	"key" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "datalake_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "datawarehouse" (
	"id" varchar PRIMARY KEY NOT NULL,
	"run_id" varchar NOT NULL,
	"datalake_id" varchar NOT NULL,
	"transformer_id" text NOT NULL,
	"collection" text NOT NULL,
	"key" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "datawarehouse_collection_key_unq" UNIQUE("collection","key")
);
--> statement-breakpoint
CREATE TABLE "datawarehouse_tombstones" (
	"collection" text NOT NULL,
	"key" text NOT NULL,
	"deleted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "datawarehouse_tombstones_collection_key_unq" UNIQUE("collection","key")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" varchar PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"mime_type" text,
	"size" integer,
	"checksum" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"datalake_id" varchar,
	"datawarehouse_id" varchar,
	CONSTRAINT "files_key_unique" UNIQUE("key"),
	CONSTRAINT "files_one_record_kind" CHECK (("files"."datalake_id" IS NULL) OR ("files"."datawarehouse_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"error" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" varchar PRIMARY KEY NOT NULL,
	"extractor_id" text NOT NULL,
	"key" text NOT NULL,
	"config" jsonb,
	"cursor" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sources_extractor_id_key_unq" UNIQUE("extractor_id","key")
);
--> statement-breakpoint
ALTER TABLE "datalake" ADD CONSTRAINT "datalake_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datalake" ADD CONSTRAINT "datalake_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datawarehouse" ADD CONSTRAINT "datawarehouse_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datawarehouse" ADD CONSTRAINT "datawarehouse_datalake_id_datalake_id_fk" FOREIGN KEY ("datalake_id") REFERENCES "public"."datalake"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_datalake_id_datalake_id_fk" FOREIGN KEY ("datalake_id") REFERENCES "public"."datalake"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_datawarehouse_id_datawarehouse_id_fk" FOREIGN KEY ("datawarehouse_id") REFERENCES "public"."datawarehouse"("id") ON DELETE set null ON UPDATE no action;