/**
 * RAGForge Landing Page
 *
 * Design manifesto: Obsidian-dark forge with molten amber accents — precision
 * geometry, atmospheric depth, and generous whitespace. Every section earns its
 * space. The forge metaphor: raw knowledge enters, refined AI intelligence
 * emerges.
 */

import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  GitFork,
  Github,
  MessageSquare,
  Search,
  Settings,
  Upload,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { FadeIn } from "@/core/components/landing/fade-in";
import { LandingHeader } from "@/core/components/landing/landing-header";

/* ─── Data ─── */

const features = [
  {
    icon: Search,
    title: "Hybrid RAG Search",
    description:
      "Vector cosine similarity meets full-text search, fused via Reciprocal Rank Fusion. Best-in-class retrieval accuracy, out of the box.",
  },
  {
    icon: Cpu,
    title: "Multi-Provider LLM",
    description:
      "Switch between OpenAI, Anthropic, or Google with a single config change. Use the model that fits your domain and budget.",
  },
  {
    icon: Upload,
    title: "Smart Document Pipeline",
    description:
      "Ingest PDFs, Markdown, and plain text. Automatic chunking with sentence-boundary snapping, batch embedding, and deduplication.",
  },
  {
    icon: MessageSquare,
    title: "Persistent Conversations",
    description:
      "Full chat history with auto-generated titles and disconnect resilience. Users pick up exactly where they left off.",
  },
  {
    icon: Settings,
    title: "Fully Configurable",
    description:
      "Theme, LLM model, system prompt, search parameters — everything lives in clean config files. Customize without touching core code.",
  },
  {
    icon: GitFork,
    title: "Fork-Friendly Open Source",
    description:
      "MIT licensed. Clone, customize, deploy. Designed for upstream updates while preserving your domain-specific changes.",
  },
];

const steps = [
  {
    number: "01",
    title: "Index Your Knowledge",
    description:
      "Upload PDFs, markdown files, or plain text through the web UI or CLI. RAGForge chunks documents intelligently and creates vector embeddings stored in PostgreSQL with pgvector.",
    detail: "Sentence-boundary snapping · Batch embedding · Hash-based dedup",
  },
  {
    number: "02",
    title: "Users Ask Questions",
    description:
      "Your users interact through a polished chat interface. Behind the scenes, hybrid search combines vector similarity (HNSW) and full-text matching (GIN) to find the most relevant knowledge.",
    detail: "Cosine similarity · tsvector full-text · RRF score fusion",
  },
  {
    number: "03",
    title: "Get Expert Answers",
    description:
      "The LLM generates accurate, grounded responses using only the retrieved context. Source attribution shows exactly which documents informed the answer.",
    detail: "Context-grounded · Source citations · No hallucination",
  },
];

const useCases = [
  {
    name: "MotoMind",
    domain: "Motorcycle Mechanics",
    description:
      "Service manuals and repair guides power an AI mechanic that helps riders troubleshoot, maintain, and fix their bikes.",
    accent: "oklch(0.65 0.22 25)",
  },
  {
    name: "FreediveCoach",
    domain: "Freediving Training",
    description:
      "Sports science literature and training protocols create an AI coach for breath-hold athletes pursuing depth and performance.",
    accent: "oklch(0.75 0.15 180)",
  },
  {
    name: "GaiaAI",
    domain: "Permaculture & Agriculture",
    description:
      "Field guides and agricultural research fuel an advisor that helps growers design resilient, productive food systems.",
    accent: "oklch(0.70 0.17 155)",
  },
];

const techStack = [
  "Next.js 16",
  "React 19",
  "AI SDK v6",
  "PostgreSQL + pgvector",
  "tRPC",
  "Drizzle ORM",
  "TailwindCSS v4",
  "Clerk Auth",
];

/* ─── Page ─── */

export default function Home() {
  return (
    <div className="dark">
      <main className="bg-background text-foreground relative min-h-screen">
        <LandingHeader />

        {/* ═══ HERO ═══ */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-14">
          {/* Atmosphere */}
          <div className="pointer-events-none absolute inset-0">
            <div className="rf-hero-glow absolute inset-0" />
            <div className="rf-dots absolute inset-0 opacity-50" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <FadeIn delay={0}>
              <div className="text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                v1.0.0 — Open Source
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl">
                Forge AI Agents
                <br />
                <span className="bg-gradient-to-r from-[var(--rf-accent)] to-[var(--rf-accent-hover)] bg-clip-text text-transparent">
                  From Real Knowledge
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
                An open-source framework for building domain-specific AI
                assistants powered by Retrieval-Augmented Generation. Feed it
                your knowledge. Get an expert.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 cursor-pointer bg-[var(--rf-accent)] px-8 text-base font-semibold text-[var(--rf-text-on-accent)] transition-all hover:bg-[var(--rf-accent-hover)]"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/pedrogritter/rag-forge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-foreground h-12 cursor-pointer border-white/15 bg-white/5 px-8 text-base hover:bg-white/10"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Button>
                </Link>
              </div>
            </FadeIn>

            {/* Tech stack strip */}
            <FadeIn delay={0.4}>
              <div className="mt-20 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
                <span className="text-muted-foreground">Built with</span>
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-muted-foreground rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="relative py-32">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="text-center">
                <p className="text-sm font-semibold tracking-wider text-[var(--rf-accent)] uppercase">
                  Capabilities
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Everything you need to build
                  <br className="hidden sm:block" />
                  expert AI agents
                </h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
                  A complete toolkit from document ingestion to production-ready
                  chat — no glue code, no boilerplate.
                </p>
              </div>
            </FadeIn>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <FadeIn key={feature.title} delay={i * 0.08}>
                  <div className="group relative rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--rf-accent-subtle)]">
                      <feature.icon className="h-5 w-5 text-[var(--rf-accent)]" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="relative py-32">
          <div className="rf-section-glow pointer-events-none absolute inset-0" />

          <div className="relative mx-auto max-w-5xl px-6">
            <FadeIn>
              <div className="text-center">
                <p className="text-sm font-semibold tracking-wider text-[var(--rf-accent)] uppercase">
                  How It Works
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  From raw documents
                  <br className="hidden sm:block" />
                  to expert answers
                </h2>
              </div>
            </FadeIn>

            <div className="mx-auto mt-16 max-w-2xl space-y-2">
              {steps.map((step, i) => (
                <FadeIn key={step.number} delay={i * 0.15}>
                  <div className="flex gap-6 sm:gap-8">
                    <div className="flex flex-col items-center">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--rf-accent-subtle)] bg-[var(--rf-accent-subtle)] font-mono text-sm font-bold text-[var(--rf-accent)]">
                        {step.number}
                      </span>
                      {i < steps.length - 1 && (
                        <div className="mt-3 h-full w-px bg-gradient-to-b from-[var(--rf-accent-subtle)] to-transparent" />
                      )}
                    </div>
                    <div className="pb-10">
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground mt-2 leading-relaxed">
                        {step.description}
                      </p>
                      <p className="mt-3 font-mono text-xs text-[var(--rf-accent-muted)]">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ USE CASES ═══ */}
        <section id="use-cases" className="relative py-32">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn>
              <div className="text-center">
                <p className="text-sm font-semibold tracking-wider text-[var(--rf-accent)] uppercase">
                  Use Cases
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  One framework,
                  <br className="hidden sm:block" />
                  infinite domains
                </h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
                  Clone the template, swap the knowledge base, customize the
                  persona. Your domain, your expert.
                </p>
              </div>
            </FadeIn>

            <div className="mt-16 grid gap-6 sm:grid-cols-3">
              {useCases.map((uc, i) => (
                <FadeIn key={uc.name} delay={i * 0.1}>
                  <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/15">
                    <div
                      className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
                      style={{ backgroundColor: uc.accent }}
                    />
                    <p
                      className="text-sm font-semibold tracking-wider uppercase"
                      style={{ color: uc.accent }}
                    >
                      {uc.domain}
                    </p>
                    <h3 className="mt-2 text-xl font-bold">{uc.name}</h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      {uc.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CONFIG SHOWCASE ═══ */}
        <section className="relative py-32">
          <div className="mx-auto max-w-3xl px-6">
            <FadeIn>
              <div className="text-center">
                <p className="text-sm font-semibold tracking-wider text-[var(--rf-accent)] uppercase">
                  Configuration
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Change your provider in one line
                </h2>
                <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
                  No vendor lock-in. Switch LLM providers, adjust search
                  parameters, or retheme the entire UI — all from clean config
                  files.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="bg-card mt-12 overflow-hidden rounded-xl border border-white/10">
                <div className="flex items-center gap-2 border-b border-white/[0.08] px-4 py-2.5">
                  <span className="h-3 w-3 rounded-full bg-[oklch(0.65_0.22_25)]" />
                  <span className="h-3 w-3 rounded-full bg-[var(--rf-accent)]" />
                  <span className="h-3 w-3 rounded-full bg-[oklch(0.70_0.17_155)]" />
                  <span className="text-muted-foreground ml-3 font-mono text-xs">
                    model.config.ts
                  </span>
                </div>
                <pre className="overflow-x-auto p-6 font-mono text-sm leading-loose">
                  <code>
                    <span className="text-[oklch(0.7_0.17_280)]">
                      export const
                    </span>{" "}
                    modelConfig <span className="text-muted-foreground">=</span>{" "}
                    <span className="text-muted-foreground">{"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-[oklch(0.72_0.16_150)]">
                      provider
                    </span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-[var(--rf-accent)]">
                      &quot;openai&quot;
                    </span>
                    <span className="text-muted-foreground">,</span>
                    {"    "}
                    <span className="text-[oklch(0.55_0.02_250)] italic">
                      {'// or "anthropic" | "google"'}
                    </span>
                    {"\n"}
                    {"  "}
                    <span className="text-[oklch(0.72_0.16_150)]">model</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-[var(--rf-accent)]">
                      &quot;gpt-4o-mini&quot;
                    </span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="text-[oklch(0.72_0.16_150)]">
                      temperature
                    </span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="text-[oklch(0.75_0.14_60)]">0.4</span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    <span className="text-muted-foreground">{"}"}</span>
                    <span className="text-muted-foreground">;</span>
                  </code>
                </pre>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="relative py-32">
          <div className="rf-cta-glow pointer-events-none absolute inset-0" />

          <div className="relative mx-auto max-w-3xl px-6 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Ready to forge{" "}
                <span className="text-[var(--rf-accent)]">your</span> AI agent?
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
                Clone the repo, index your knowledge, and deploy a
                domain-specific AI assistant in minutes.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 cursor-pointer bg-[var(--rf-accent)] px-8 text-base font-semibold text-[var(--rf-text-on-accent)] transition-all hover:bg-[var(--rf-accent-hover)]"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/pedrogritter/rag-forge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-foreground h-12 cursor-pointer border-white/15 bg-white/5 px-8 text-base hover:bg-white/10"
                  >
                    View on GitHub
                  </Button>
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <div className="mt-12 inline-block rounded-lg border border-white/[0.08] bg-white/[0.03] px-6 py-4">
                <pre className="text-muted-foreground font-mono text-sm">
                  <span className="text-[var(--rf-accent)]">$</span> git clone
                  https://github.com/pedrogritter/rag-forge.git
                </pre>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-white/[0.08] py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--rf-accent)]">
                <span className="text-xs font-black text-[var(--rf-text-on-accent)]">
                  R
                </span>
              </div>
              <span className="text-sm font-semibold">RAG Forge</span>
            </div>

            <div className="text-muted-foreground flex items-center gap-6 text-sm">
              <Link
                href="https://github.com/pedrogritter/rag-forge"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
              <Link
                href="https://github.com/pedrogritter/rag-forge/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Issues
              </Link>
              <span>MIT License</span>
            </div>

            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} RAG Forge
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
