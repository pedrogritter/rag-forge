import type { UIMessage } from "ai";
import { cn } from "@/core/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { Card, CardContent } from "@/core/components/ui/card";
import { useUser } from "@clerk/nextjs";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useUser();

  const usersInitials = user?.firstName?.substring(0, 0);

  const textContent = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  const toolPart = message.parts.find((p) => p.type === "tool-invocation") as
    | { type: "tool-invocation"; toolInvocation: { toolName: string } }
    | undefined;

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
          {textContent.length > 0 ? (
            <div className="whitespace-pre-wrap">{textContent}</div>
          ) : toolPart ? (
            <span className="text-muted-foreground italic">
              {"Calling tool: " + toolPart.toolInvocation.toolName}
            </span>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
