# RAGForge

An open-source developer template for building domain-specific AI chatbots powered by **Retrieval-Augmented Generation**. Clone the repo, ingest your knowledge base, customize the theme, and deploy an expert assistant grounded in your own content.

---

## Features

### Core RAG
- **Hybrid Search** — pgvector cosine similarity (HNSW) + PostgreSQL full-text search (GIN) + Reciprocal Rank Fusion, executed in parallel
- **Multi-Provider LLM** — Switch between OpenAI, Anthropic, and Google from the settings UI or config
- **Document Ingestion** — Drag-and-drop upload (PDF, Markdown, Text) or batch CLI ingestion with SHA-256 dedup
- **Rich Source Attribution** — Collapsible panels showing source filename, page number, and RRF similarity scores

### Chat
- **Chat History** — Persistent conversations stored as AI SDK UIMessage[] JSONB, auto-titled, cursor-paginated (25/page)
- **Markdown Rendering** — Syntax-highlighted code blocks, tables, GFM in assistant responses
- **Reasoning Display** — Collapsible reasoning blocks for Anthropic extended thinking and OpenAI reasoning models
- **Context Window Truncation** — Sliding-window message limit (default 20) to prevent context overflow and control cost
- **Regenerate** — Re-stream the last assistant response with a single click
- **Welcome Suggestions** — LLM-generated topic chips or static tips on empty chat

### Customization
- **Theme System** — 7 color presets (oklch), font selection, brand name — all configurable at runtime
- **Runtime Settings** — System prompt, temperature, provider/model selection from the settings page
- **Landing Page** — Data-driven hero, features, timeline, use cases, and config showcase sections with scroll animations

### Safety & Quality
- **Content Moderation** — OpenAI Moderation API with keyword blocklist fallback (fail-open)
- **Rate Limiting** — Sliding-window per-IP + per-user rate limiter on chat (20 req/min) and uploads (5 req/min)
- **Input Validation** — Server-side 4000 char limit, client-side character counter, output token guard (2048)
- **80 Unit Tests** across 8 suites (Jest) + 19 E2E test cases across 4 suites (Cypress)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, TailwindCSS v4, Shadcn UI, motion |
| AI | Vercel AI SDK v6, OpenAI / Anthropic / Google |
| Database | PostgreSQL + pgvector (Drizzle ORM) |
| API | tRPC v11 (chat CRUD), Route Handlers (streaming) |
| Auth | Clerk |
| State | Zustand (sidebar, settings, theme config) |
| Testing | Jest (80 tests, 8 suites), Cypress (19 E2E tests) |
| Package Manager | pnpm 10 (**required**) |

---

## Quick Start

```bash
# Clone
git clone https://github.com/your-username/rag-forge.git
cd rag-forge

# Install
pnpm install

# Environment
cp .env.example .env
# Fill in POSTGRES_URL, OPENAI_API_KEY, and Clerk keys

# Database
./start-database.sh   # or use your own Postgres + pgvector
pnpm db:push          # push schema

# Run
pnpm dev              # http://localhost:3000
```

### Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `POSTGRES_URL` | Yes | PostgreSQL connection string (needs pgvector extension) |
| `OPENAI_API_KEY` | For OpenAI/embeddings | Also needed for embeddings regardless of chat provider |
| `ANTHROPIC_API_KEY` | For Anthropic | Set if `modelConfig.provider` is `"anthropic"` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | For Google | Set if `modelConfig.provider` is `"google"` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | From [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Yes | From Clerk Dashboard |

---

## Customization

All configuration lives in `src/config/`:

### Assistant (`assistant.config.ts`)
System prompt defining your assistant's personality and domain expertise. Users can also override this at runtime via the Settings page.

### Model (`model.config.ts`)
```ts
{
  provider: "openai",       // "openai" | "anthropic" | "google"
  model: "gpt-4o-mini",
  temperature: 0.4,
  maxTokens: 2048,          // output token guard
  maxContextMessages: 20,   // sliding-window context truncation
}
```
Provider and model can also be switched at runtime from the Settings page (only providers with configured API keys are shown).

### Vector Search (`vector.config.ts`)
Embedding model (`text-embedding-3-small`), dimensions (512), chunk sizes, similarity thresholds, top-K, RRF weights.

### Theme (`theme.config.ts`)
Brand name, color preset, font family, layout defaults. Users can also customize at runtime via the Settings page (`/dashboard/settings`).

---

## Ingesting Documents

### Web Upload
Open the sidebar in the dashboard and drag-and-drop files (PDF, `.md`, `.mdx`, `.txt`). 10 MB limit per file.

### CLI Batch Ingestion
```bash
# Place PDF files in src/data/
pnpm extractPDFs
```
Features SHA-256 dedup, batch embedding (5/batch), timeout protection, and progress logging.

---

## Project Structure

```
src/
├── app/                    # Next.js routes + layouts
│   ├── page.tsx            # Landing page
│   ├── (dashboard)/        # Auth-gated dashboard
│   │   └── dashboard/
│   │       ├── c/[id]/     # Chat conversation pages
│   │       ├── faq/        # Help & FAQ page
│   │       ├── resources/  # Knowledge base management
│   │       └── settings/   # Theme, model, prompt settings
│   └── api/
│       ├── chat/           # Streaming RAG endpoint
│       ├── documents/      # File upload endpoint
│       ├── settings/       # Provider detection endpoint
│       └── trpc/           # tRPC handler
├── config/                 # Assistant, model, theme, vector config
├── core/
│   ├── components/         # App shell, chat UI, landing, Shadcn primitives
│   ├── hooks/              # Zustand stores (sidebar, settings, theme)
│   └── lib/
│       ├── ai/             # Provider registry, embeddings, hybrid search, moderation
│       └── ingestion/      # Document processors, chunking, pipeline
├── server/
│   ├── api/                # tRPC routers (chats, resources CRUD)
│   └── db/schema/          # Drizzle schemas (5 tables)
└── styles/                 # Tailwind + brand CSS variables
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm check` | ESLint + TypeScript |
| `pnpm test` | Jest unit tests (80 tests) |
| `pnpm test:coverage` | Jest with coverage report |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Visual database browser |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm extractPDFs` | Batch PDF ingestion |

---

## Dashboard Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Creates a new chat and redirects |
| `/dashboard/c/[id]` | Chat conversation with RAG-powered responses |
| `/dashboard/resources` | Knowledge base management — view indexed documents, chunk counts, cascading delete |
| `/dashboard/settings` | Color presets, fonts, brand name, system prompt, temperature, provider/model selection |
| `/dashboard/faq` | Help & FAQ — getting started, file types, customization, shortcuts, troubleshooting |

---

## Database Schema

All tables use the `ragforge_` prefix (via Drizzle `pgTableCreator`).

| Table | Purpose |
|-------|---------|
| `ragforge_resources` | Raw content store (id, content, timestamps) |
| `ragforge_embeddings` | Vector embeddings (512-dim), tsvector for full-text search. HNSW + GIN indexes |
| `ragforge_chats` | Conversations with UIMessage[] as JSONB column |
| `ragforge_pdf_resources` | PDF file tracking (filename, file hash, page count) |
| `ragforge_pdf_embeddings` | PDF chunk metadata (page number, page title) |

---

## Use Cases

RAGForge is designed as a cloneable template. Example knowledge assistants:

- **StudyForge** — Academic study aid using textbooks, lecture notes, and research papers
- **ArchiveAI** — Historical researcher cross-referencing local archives and primary sources
- **LabNotes** — Research lab assistant tracking protocols, experiments, and unpublished findings

Each clone customizes `src/config/`, ingests its own knowledge base, and deploys independently.

---

## License

Open source. Contributions welcome.
