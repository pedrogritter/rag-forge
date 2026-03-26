/**
 * RAGForge Landing Page
 *
 * Design: Editorial developer aesthetic — asymmetric hero, bento feature grid,
 * columnar process flow, and varied section pacing. Each section earns its own
 * visual character instead of repeating a uniform template.
 */

import Link from "next/link";
import Image from "next/image";
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
import { themeConfig } from "@/config/theme.config";

/* ─── Data ─── */

const features = [
  {
    icon: Search,
    title: "Hybrid RAG Search",
    description:
      "Vector cosine similarity meets full-text search, fused via Reciprocal Rank Fusion. Best-in-class retrieval accuracy, out of the box.",
    wide: true,
  },
  {
    icon: Cpu,
    title: "Multi-Provider LLM",
    description:
      "Switch between OpenAI, Anthropic, or Google with a single config change. Use the model that fits your domain and budget.",
    wide: true,
  },
  {
    icon: Upload,
    title: "Smart Document Pipeline",
    description:
      "Ingest PDFs, Markdown, and plain text. Automatic chunking with sentence-boundary snapping, batch embedding, and deduplication.",
    wide: false,
  },
  {
    icon: MessageSquare,
    title: "Persistent Conversations",
    description:
      "Full chat history with auto-generated titles and disconnect resilience. Users pick up exactly where they left off.",
    wide: false,
  },
  {
    icon: Settings,
    title: "Fully Configurable",
    description:
      "Theme, LLM model, system prompt, search parameters — everything lives in clean config files. Customize without touching core code.",
    wide: false,
  },
  {
    icon: GitFork,
    title: "Fork-Friendly Open Source",
    description:
      "MIT licensed. Clone, customize, deploy. Designed for upstream updates while preserving your domain-specific changes.",
    wide: false,
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

/* ─── Page ─── */

export default function Home() {
  return (
    <div className="dark">
      <main className="bg-background text-foreground relative min-h-screen">
        <LandingHeader />

        {/* ═══ HERO — Asymmetric, text-left + logo-right ═══ */}
        <section className="relative flex min-h-[85vh] items-center overflow-hidden pt-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="rf-hero-glow absolute inset-0" />
            <div className="rf-dots absolute inset-0 opacity-50" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
                <FadeIn delay={0.1}>
                  <h1 className="text-4xl font-black tracking-tighter sm:text-6xl lg:text-7xl">
                    Forge Knowledge
                    <br />
                    Assistants
                    <br />
                    <span className="bg-gradient-to-r from-[var(--rf-accent)] to-[var(--rf-accent-hover)] bg-clip-text text-transparent">
                      From Real Knowledge
                    </span>
                  </h1>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <p className="text-muted-foreground mt-6 max-w-lg text-lg leading-relaxed">
                    An open-source framework for building domain-specific AI
                    assistants powered by Retrieval-Augmented Generation.
                    Feed&nbsp;it your knowledge. Get&nbsp;an expert.
                  </p>
                </FadeIn>

                <FadeIn delay={0.25}>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        className="h-11 cursor-pointer bg-[var(--rf-accent)] px-8 text-base font-semibold text-[var(--rf-text-on-accent)] transition-all hover:bg-[var(--rf-accent-hover)] active:scale-[0.97]"
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
                        className="text-foreground h-11 cursor-pointer border-white/15 bg-white/5 px-8 text-base hover:bg-white/10 active:scale-[0.97]"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </Button>
                    </Link>
                  </div>
                </FadeIn>

                <FadeIn delay={0.35}>
                  <p className="text-muted-foreground/60 mt-8 max-w-md font-mono text-xs leading-relaxed">
                    Next.js · React 19 · AI SDK v6 · PostgreSQL + pgvector ·
                    tRPC · Drizzle ORM · TailwindCSS v4
                  </p>
                </FadeIn>
              </div>

              {/* Logo — right side on desktop */}
              {themeConfig.logoUrl && (
                <FadeIn delay={0} direction="none">
                  <div className="relative hidden justify-center lg:flex">
                    <div className="absolute -inset-12 rounded-full bg-[var(--rf-accent)]/[0.06] blur-3xl" />
                    <div className="absolute -inset-6 rounded-full bg-[var(--rf-accent)]/[0.10] blur-xl" />
                    <Image
                      src={themeConfig.logoUrl}
                      alt={themeConfig.brandName}
                      width={1024}
                      height={1024}
                      className="relative h-80 w-80 drop-shadow-[0_0_40px_var(--rf-accent-subtle)] xl:h-96 xl:w-96"
                      priority
                    />
                  </div>
                </FadeIn>
              )}
            </div>

            {/* Logo — stacked below on mobile */}
            {themeConfig.logoUrl && (
              <FadeIn delay={0.1}>
                <div className="relative mt-12 flex justify-center lg:hidden">
                  <div className="absolute -inset-8 rounded-full bg-[var(--rf-accent)]/[0.06] blur-3xl" />
                  <Image
                    src={themeConfig.logoUrl}
                    alt={themeConfig.brandName}
                    width={512}
                    height={512}
                    className="relative h-48 w-48 drop-shadow-[0_0_40px_var(--rf-accent-subtle)] sm:h-56 sm:w-56"
                    priority
                  />
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        {/* ═══ FEATURES — Bento grid (2 wide + 4 narrow) ═══ */}
        <section id="features" className="relative py-24 lg:py-36">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn>
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Everything you need to build expert knowledge assistants
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl text-lg">
                From document ingestion to production-ready chat — no glue code,
                no boilerplate.
              </p>
            </FadeIn>

            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <FadeIn
                  key={feature.title}
                  delay={i * 0.06}
                  className={feature.wide ? "sm:col-span-2" : ""}
                >
                  <div className="group relative flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.04]">
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

        {/* ═══ HOW IT WORKS — Three side-by-side columns ═══ */}
        <section id="how-it-works" className="relative py-20 lg:py-28">
          <div className="rf-section-glow pointer-events-none absolute inset-0" />

          <div className="relative mx-auto max-w-6xl px-6">
            <FadeIn>
              <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                From raw documents to expert answers
              </h2>
            </FadeIn>

            <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {steps.map((step, i) => (
                <FadeIn key={step.number} delay={i * 0.12}>
                  <div className="flex flex-col">
                    <span className="font-mono text-6xl font-black text-[var(--rf-accent)]/20 lg:text-7xl">
                      {step.number}
                    </span>
                    <h3 className="-mt-2 text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    <p className="mt-4 font-mono text-xs text-[var(--rf-accent-muted)]">
                      {step.detail}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ USE CASES — Editorial left-border treatment ═══ */}
        <section id="use-cases" className="relative py-24">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn>
              <h2 className="max-w-md text-3xl font-bold tracking-tight sm:text-4xl">
                One framework, infinite domains
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg">
                Clone the template, swap the knowledge base, customize the
                persona. Your domain, your expert.
              </p>
            </FadeIn>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {useCases.map((uc, i) => (
                <FadeIn key={uc.name} delay={i * 0.1}>
                  <div
                    className="border-l-2 py-1 pl-5"
                    style={{ borderColor: uc.accent }}
                  >
                    <p
                      className="text-sm font-semibold tracking-wider uppercase"
                      style={{ color: uc.accent }}
                    >
                      {uc.domain}
                    </p>
                    <h3 className="mt-2 text-xl font-bold">{uc.name}</h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {uc.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CONFIG + CTA — Split layout ═══ */}
        <section className="relative py-24 lg:py-32">
          <div className="rf-cta-glow pointer-events-none absolute inset-0" />

          <div className="relative mx-auto max-w-6xl px-6">
            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left: pitch + actions */}
              <div>
                <FadeIn>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Ready to forge{" "}
                    <span className="text-[var(--rf-accent)]">your</span>{" "}
                    knowledge assistant?
                  </h2>
                  <p className="text-muted-foreground mt-4 max-w-md text-lg">
                    No vendor lock-in. Switch LLM providers, adjust search
                    parameters, or retheme the entire UI — all from clean config
                    files.
                  </p>
                </FadeIn>

                <FadeIn delay={0.15}>
                  <div className="mt-8">
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        className="h-12 cursor-pointer bg-[var(--rf-accent)] px-8 text-base font-semibold text-[var(--rf-text-on-accent)] transition-all hover:bg-[var(--rf-accent-hover)] active:scale-[0.97]"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <div className="mt-6 inline-block rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-3">
                    <pre className="text-muted-foreground font-mono text-sm">
                      <span className="text-[var(--rf-accent)]">$</span> git
                      clone https://github.com/pedrogritter/rag-forge.git
                    </pre>
                  </div>
                </FadeIn>
              </div>

              {/* Right: config code block */}
              <FadeIn delay={0.1} direction="none">
                <div className="bg-card overflow-hidden rounded-xl border border-white/10">
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
                      modelConfig{" "}
                      <span className="text-muted-foreground">=</span>{" "}
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
