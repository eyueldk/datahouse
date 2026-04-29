CREATE TABLE "file_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"datalake_id" uuid,
	"datawarehouse_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "file_refs_kind_check" CHECK ((
        ("file_references"."datalake_id" is not null and "file_references"."datawarehouse_id" is null) or
        ("file_references"."datalake_id" is null and "file_references"."datawarehouse_id" is not null)
      ))
);
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_datalake_id_datalake_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_datawarehouse_id_datawarehouse_id_fk";
--> statement-breakpoint
ALTER TABLE "file_references" ADD CONSTRAINT "file_references_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_references" ADD CONSTRAINT "file_references_datalake_id_datalake_id_fk" FOREIGN KEY ("datalake_id") REFERENCES "public"."datalake"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_references" ADD CONSTRAINT "file_references_datawarehouse_id_datawarehouse_id_fk" FOREIGN KEY ("datawarehouse_id") REFERENCES "public"."datawarehouse"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "file_refs_file_datalake_unq" ON "file_references" USING btree ("file_id","datalake_id");--> statement-breakpoint
CREATE UNIQUE INDEX "file_refs_file_datawarehouse_unq" ON "file_references" USING btree ("file_id","datawarehouse_id");--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "datalake_id";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "datawarehouse_id";