import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/server/db";
import { chats } from "@/server/db/schema";
import { nanoid } from "@/core/lib/utils";

export default async function Dashboard() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  // Create a new chat and redirect to it
  const id = nanoid();
  await db.insert(chats).values({ id, userId });
  redirect(`/dashboard/c/${id}`);
}
