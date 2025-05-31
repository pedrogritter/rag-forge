import type { Message } from "ai";
import { cn } from "@/core/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Card, CardContent } from "@/core/components/ui/card";
import { useUser } from "@clerk/nextjs";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useUser();

  const usersInitials = user?.firstName?.substring(0, 0);
  console.log(message);

  // const messageContent = message.parts;

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        message.role === "user" ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar className="h-8 w-8">
        {message.role === "user" && user?.imageUrl && (
          <AvatarImage src={user.imageUrl} alt="User's avatar" />
        )}
        <AvatarFallback>
          {message.role === "user" ? (usersInitials ?? "U") : "A"}
        </AvatarFallback>
        {/* Add actual avatars later if needed */}
      </Avatar>

      <Card
        className={cn(
          "max-w-[80%]",
          message.role === "user"
            ? "bg-primary/10 dark:bg-primary/20"
            : "bg-muted",
        )}
      >
        <CardContent className="p-3 text-sm">
          {message.content.length > 0 ? (
            // <div className="whitespace-pre-wrap">{message.content}</div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <span className="text-muted-foreground italic">
              {"Calling tool:" + message.toolInvocations?.[0]?.toolName}
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
