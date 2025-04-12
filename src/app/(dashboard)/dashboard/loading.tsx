// export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLoading() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();

  return (
    <div className="flex items-center justify-center">
      <h1 className="text-2xl font-bold">Loading Dashboard...</h1>
    </div>
  );
}
