**RAGForge** is an open-source developer framework and template for building expert-level, AI-powered agents using **Retrieval-Augmented Generation (RAG)**.

Each agent is focused on a specific domain (e.g., motorcycle mechanics, freediving, permaculture), powered by vector-embedded content (manuals, books, articles), and built on a shared, extendable base code structure. The goal is to allow developers to clone the base agent (RAGForge), customize its knowledge base and interface, and optionally receive updates from the main template repo via version tracking and a CLI update tool.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, TailwindCSS, Shadcn UI  
- **Backend:** tRPC, Supabase (Postgres + pgvector), OpenAI API  
- **Testing:** Jest (unit), Playwright or Cypress (e2e)  
- **DevOps:** Vercel deployment, Docker for local PG/VectorDB, custom CLI for indexing and updates

---

## 🔧 Core Features

- Command-line tools to parse & index PDFs into vector DB
- Chat interface with expert AI agents using RAG
- Shared base template repo with update mechanism (`pnpm updateAgent`)
- Version tracking system to maintain sync with upstream template
- Full test suite with ~70% code coverage
- Built-in support for role behaviors, context tracking, and chat history
- Extendable UI and system prompts per agent

---

## 🔄 Code Architecture Goals

- **Modular:** Core logic lives in `core/`, shared by all agents
- **Extendable:** Developers can freely add UI components, tools, and domain-specific logic
- **Updatable:** Agents can safely merge updates from `ragforge` without losing customizations

---

## 👨‍🔧 Use Cases

- **MotoMind**: Motorcycle mechanic expert using service manuals  
- **FreediveCoach**: Freediving training expert augmented with sports manuals  
- **GaiaAI**: Permaculture/gardening advisor using field-specific literature  

Each agent uses its own knowledge base and theme, but is based on the same `RAGForge` core template.

---

## 🧪 Work In Progress

- CLI for:
  - Agent setup and knowledge indexing
  - Template updates with version diffing
- Version tracking system via `ragforge.config.ts`
- Template improvements: chat context growth, better state handling, agent-specific roles

---

## ✨ Contribution & Vision

The long-term goal is to make **RAGForge** a modular and developer-friendly framework for building smart, contextual, domain-specific assistants. Contributions, feedback, and forks are welcome!

---
