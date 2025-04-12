import Link from "next/link";
import { api, HydrateClient } from "@/trpc/server";
import { FileCode2, Sparkles } from "lucide-react";
import { TopBar } from "@/core/components/top-bar";

export default async function Home() {
  const hello = await api.chat.hello({ text: "from tRPC" });

  return (
    <HydrateClient>
      <TopBar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#08a087] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
          <h1 className="text-xl font-extrabold tracking-tight drop-shadow-xl sm:text-[5rem]">
            RAG <span className="text-[hsl(256,100%,70%)]">Forge</span>
          </h1>
          <h2 className="text-xl font-bold tracking-tighter sm:text-[3rem]">
            Build your own AI expert.
          </h2>
          <h3 className="px-20 text-center text-xl font-light tracking-tight">
            An open-source framework for creating smart, domain-specific AI
            agents powered by real-world knowledge — customizable, updatable,
            and ready to deploy.
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col items-center gap-4 rounded-xl bg-white/20 p-6 hover:bg-white/30"
              href=""
              target="_blank"
            >
              <div className="flex flex-row items-center gap-4">
                <Sparkles color="#262626" />
                <h3 className="text-2xl font-black text-neutral-800">
                  First Steps
                </h3>
              </div>
              <div className="text-lg">
                Learn to replicate the agent with your own knowledge-base and
                how to deploy it.
              </div>
            </Link>
            <Link
              className="flex max-w-2xs flex-col items-center gap-4 rounded-xl bg-white/20 p-6 align-middle hover:bg-white/30"
              href="https://github.com/pedrogritter/rag-forge"
              target="_blank"
            >
              <div className="flex flex-row items-center gap-4">
                <h3 className="text-2xl font-black text-neutral-800">
                  Source Code
                </h3>
                <FileCode2 color="#262626" />
              </div>

              <div className="text-lg">
                Check out the code behind the framework and fork the repo.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
            <Link
              className="flex max-w-xs flex-row items-center gap-4 rounded-xl bg-white/10 p-4 align-middle hover:bg-white/20"
              href="/dashboard"
              target="_blank"
            >
              <h3 className="text-2xl">Try it out</h3>
              <FileCode2 />
            </Link>
          </div>

          {/* <LatestPost /> */}
        </div>
      </main>
    </HydrateClient>
  );
}
