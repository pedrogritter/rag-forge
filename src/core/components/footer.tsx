import React from "react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border/40 border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          {/* Placeholder for a small logo or icon */}
          {/* <Icons.logo className="h-6 w-6" /> */}
          <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
            Built by{" "}
            <Link
              href="https://example.com" // Replace with actual creator link
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Your Name/Company
            </Link>
            . The source code is available on{" "}
            <Link
              href="https://github.com/your-repo" // Replace with actual repo link
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
        <p className="text-muted-foreground text-center text-sm md:text-left">
          © {currentYear} RAG Forge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
