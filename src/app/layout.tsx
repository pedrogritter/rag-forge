import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/core/lib/utils";
import { ThemeProvider } from "@/core/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";
import "@/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "RAG Forge",
  description:
    "A customizable, open-source template for building AI RAG agents",
  icons: [{ rel: "icon", url: "/iron.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html
        lang="en"
        className={cn("scroll-smooth", geist.variable)}
        suppressHydrationWarning
      >
        <body>
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
