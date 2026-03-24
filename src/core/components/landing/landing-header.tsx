"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/lib/utils";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 border-b border-white/[0.08] backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--rf-accent)]">
            <span className="text-sm font-black text-[var(--rf-text-on-accent)]">
              R
            </span>
          </div>
          <span className="text-foreground text-sm font-bold tracking-tight">
            RAG Forge
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/pedrogritter/rag-forge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="/dashboard">
            <Button
              size="sm"
              className="h-8 cursor-pointer bg-[var(--rf-accent)] px-4 text-xs font-semibold text-[var(--rf-text-on-accent)] hover:bg-[var(--rf-accent-hover)]"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
