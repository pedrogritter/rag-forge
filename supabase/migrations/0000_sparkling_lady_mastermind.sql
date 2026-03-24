CREATE TABLE "ragforge_chats" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" text,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ragforge_embeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"resource_id" varchar(191) NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(512),
	"search_vector" "tsvector",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ragforge_pdf_embeddings" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"embedding_id" varchar(191) NOT NULL,
	"page_number" integer,
	"page_title" text
);
--> statement-breakpoint
CREATE TABLE "ragforge_pdf_resources" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"resource_id" varchar(191) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"page_count" integer,
	"last_processed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ragforge_resources" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ragforge_embeddings" ADD CONSTRAINT "ragforge_embeddings_resource_id_ragforge_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."ragforge_resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ragforge_pdf_embeddings" ADD CONSTRAINT "ragforge_pdf_embeddings_embedding_id_ragforge_embeddings_id_fk" FOREIGN KEY ("embedding_id") REFERENCES "public"."ragforge_embeddings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ragforge_pdf_resources" ADD CONSTRAINT "ragforge_pdf_resources_resource_id_ragforge_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."ragforge_resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embeddings_search_vector_idx" ON "ragforge_embeddings" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "embeddings_vector_hnsw_idx" ON "ragforge_embeddings" USING hnsw ("embedding" vector_cosine_ops);