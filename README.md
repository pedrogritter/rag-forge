# RAGForge

An open-source developer template for building domain-specific AI chatbots powered by **Retrieval-Augmented Generation**. Clone the repo, ingest your knowledge base, customize the theme, and deploy an expert assistant grounded in your own content.

---

## Features

- **Hybrid RAG Search** — pgvector cosine similarity (HNSW) + PostgreSQL full-text search (GIN) + Reciprocal Rank Fusion
- **Multi-Provider LLM** — Switch between OpenAI, Anthropic, and Google with a single config change
- **Document Ingestion** — Drag-and-drop upload (PDF, Markdown, Text) or batch CLI ingestion with dedup
- **Chat History** — Persistent conversations stored as AI SDK UIMessage[] JSONB, auto-titled
- **Source Attribution** — Collapsible panels showing which chunks informed each response, with similarity scores
- **Theme Customization** — 7 color presets, font selection, brand name — all configurable at runtime via settings page
- **Markdown Rendering** — Syntax-highlighted code blocks, tables, GFM in assistant responses
- **Rate Limiting** — Sliding-window per-IP rate limiter on the chat endpoint (20 req/min)

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
| State | Zustand (sidebar, theme config) |
| Testing | Jest (19 tests), Cypress (installed) |
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

### Agent (`agent.config.ts`)
System prompt defining your agent's personality and domain expertise.

### Model (`model.config.ts`)
```ts
{
  provider: "openai",    // "openai" | "anthropic" | "google"
  model: "gpt-4o-mini",
  temperature: 0.4,
}
```

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
│   │       └── settings/   # Theme customization
│   └── api/
│       ├── chat/           # Streaming RAG endpoint
│       ├── documents/      # File upload endpoint
│       └── trpc/           # tRPC handler
├── config/                 # Agent, model, theme, vector config
├── core/
│   ├── components/         # App shell, chat UI, landing, Shadcn primitives
│   ├── hooks/              # Zustand stores (sidebar, theme)
│   └── lib/
│       ├── ai/             # Provider registry, embeddings, hybrid search
│       └── ingestion/      # Document processors, chunking, pipeline
├── server/
│   ├── api/                # tRPC routers (chat CRUD)
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
| `pnpm test` | Jest unit tests |
| `pnpm test:coverage` | Jest with coverage report |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Visual database browser |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm extractPDFs` | Batch PDF ingestion |

---

## Use Cases

RAGForge is designed as a cloneable template. Example agents:

- **MotoMind** — Motorcycle mechanic using service manuals
- **FreediveCoach** — Freediving training from sports literature
- **GaiaAI** — Permaculture advisor from gardening references

Each clone customizes `src/config/`, ingests its own knowledge base, and deploys independently.

---

## License

Open source. Contributions welcome.
