import { type UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import Chat from "@/core/components/chat/chat";
import { db } from "@/server/db";
import { chats } from "@/server/db/schema";

export default async function ChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const { id } = await props.params;

  const [chat] = await db.select().from(chats).where(eq(chats.id, id)).limit(1);

  if (!chat || chat.userId !== userId) return notFound();

  return (
    <Chat
      id={id}
      initialMessages={chat.messages as UIMessage[]}
      className="flex h-full flex-1 flex-col"
    />
  );
}
