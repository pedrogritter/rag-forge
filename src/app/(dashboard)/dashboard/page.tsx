// import { setTimeout } from "timers/promises";
// export const dynamic = "force-dynamic";
import Chat from "@/core/components/chat/chat";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  return (
    <main className="container mx-auto flex h-full flex-1 justify-center px-4 py-8">
      <div className="flex w-full max-w-2xl flex-col">
        <Chat className="flex h-full flex-1 flex-col" />
      </div>
    </main>
  );
}
