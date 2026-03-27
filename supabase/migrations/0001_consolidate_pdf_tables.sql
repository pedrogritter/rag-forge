-- Add PDF metadata columns to resources table
ALTER TABLE "ragforge_resources" ADD COLUMN "type" varchar(10) DEFAULT 'text' NOT NULL;
ALTER TABLE "ragforge_resources" ADD COLUMN "filename" varchar(255);
ALTER TABLE "ragforge_resources" ADD COLUMN "file_hash" varchar(64);
ALTER TABLE "ragforge_resources" ADD COLUMN "page_count" integer;
--> statement-breakpoint
-- Add page metadata columns to embeddings table
ALTER TABLE "ragforge_embeddings" ADD COLUMN "page_number" integer;
ALTER TABLE "ragforge_embeddings" ADD COLUMN "page_title" text;
--> statement-breakpoint
-- Migrate existing PDF resource data into unified resources table
UPDATE "ragforge_resources" r SET
  "filename" = pr."filename",
  "file_hash" = pr."file_hash",
  "page_count" = pr."page_count",
  "type" = 'pdf'
FROM "ragforge_pdf_resources" pr
WHERE pr."resource_id" = r."id";
--> statement-breakpoint
-- Migrate existing PDF embedding metadata into unified embeddings table
UPDATE "ragforge_embeddings" e SET
  "page_number" = pe."page_number",
  "page_title" = pe."page_title"
FROM "ragforge_pdf_embeddings" pe
WHERE pe."embedding_id" = e."id";
--> statement-breakpoint
-- Drop old PDF tables (foreign keys will be dropped automatically with the tables)
ALTER TABLE "ragforge_pdf_embeddings" DROP CONSTRAINT "ragforge_pdf_embeddings_embedding_id_ragforge_embeddings_id_fk";
ALTER TABLE "ragforge_pdf_resources" DROP CONSTRAINT "ragforge_pdf_resources_resource_id_ragforge_resources_id_fk";
DROP TABLE "ragforge_pdf_embeddings";
DROP TABLE "ragforge_pdf_resources";
