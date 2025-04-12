// import { setTimeout } from "timers/promises";
// export const dynamic = "force-dynamic";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  // const res = await setTimeout(2000, "result");

  const user = await currentUser();

  return (
    <div className="flex items-center justify-center border-2 border-amber-300">
      <h1 className="text-5xl font-extrabold">{`Welcome ${user?.firstName} to the dashboard`}</h1>
    </div>
  );
}
