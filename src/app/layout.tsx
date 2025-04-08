import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/core/lib/utils";
import { ThemeProvider } from "@/core/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { AppShell } from "@/core/components/app-shell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "RAG Forge",
  description:
    "A customizable, open-source template for building AI RAG agents",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
