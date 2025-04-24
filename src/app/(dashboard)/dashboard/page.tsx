// import { setTimeout } from "timers/promises";
// export const dynamic = "force-dynamic";
import Chat from "@/core/components/chat/chat";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  // const res = await setTimeout(2000, "result");

  const user = await currentUser();

  return (
    // <div className="flex flex-col items-start justify-center border-2 border-amber-300">
    //   <h1 className="text-xl font-extrabold">{`Welcome ${user?.firstName} to the dashboard`}</h1>
    //   <Chat></Chat>
    // </div>

    <main className="container mx-auto flex flex-1 justify-center px-4 py-8">
      {/* <div className="flex h-[calc(100vh-200px)] w-full max-w-2xl flex-col"> */}
      <div className="flex h-full w-full max-w-2xl flex-col">
        <Chat className="flex h-full flex-1 flex-col" />
      </div>
    </main>
  );
}
