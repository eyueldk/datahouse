CREATE TABLE "bronze_records" (
	"id" varchar PRIMARY KEY NOT NULL,
	"run_id" varchar NOT NULL,
	"source_id" varchar NOT NULL,
	"key" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bronze_records_key_unique" UNIQUE("key")
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
	CONSTRAINT "files_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "gold_records" (
	"id" varchar PRIMARY KEY NOT NULL,
	"run_id" varchar NOT NULL,
	"bronze_record_id" varchar NOT NULL,
	"transformer_id" text NOT NULL,
	"collection" text NOT NULL,
	"key" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gold_record_collection_key_unq" UNIQUE("collection","key")
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
ALTER TABLE "bronze_records" ADD CONSTRAINT "bronze_records_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bronze_records" ADD CONSTRAINT "bronze_records_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold_records" ADD CONSTRAINT "gold_records_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold_records" ADD CONSTRAINT "gold_records_bronze_record_id_bronze_records_id_fk" FOREIGN KEY ("bronze_record_id") REFERENCES "public"."bronze_records"("id") ON DELETE cascade ON UPDATE no action;
