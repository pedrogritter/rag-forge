"use client";

import { useState } from "react";
import type { UIMessage } from "ai";
import { isToolUIPart, getToolName } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/core/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import {
  ChevronDown,
  ChevronRight,
  Search,
  BookPlus,
  Loader2,
} from "lucide-react";

interface SourceChunk {
  content: string;
  similarity?: number;
}

type ToolPart = Extract<UIMessage["parts"][number], { toolCallId: string }>;

function ToolInvocationPart({ part }: { part: ToolPart }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toolName = getToolName(part);
  const { state } = part;

  const isSearching = toolName === "getInformation";
  const isLoading = state === "input-streaming" || state === "input-available";

  if (isLoading) {
    const label = isSearching
      ? "Searching knowledge base..."
      : toolName === "addResource"
        ? "Adding to knowledge base..."
        : `Using ${toolName}...`;

    return (
      <div className="text-muted-foreground flex items-center gap-2 py-1 text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>{label}</span>
      </div>
    );
  }

  if (
    isSearching &&
    state === "output-available" &&
    Array.isArray(part.output)
  ) {
    const sources = part.output as SourceChunk[];
    if (sources.length === 0) return null;

    return (
      <div className="py-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 text-xs transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          <Search className="h-3.5 w-3.5" />
          <span>
            Found {sources.length} source{sources.length !== 1 ? "s" : ""}
          </span>
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {sources.map((source, i) => (
              <div
                key={`source-${i}`}
                className="border-border/40 bg-muted/30 rounded-md border p-2 text-xs"
              >
                <div className="text-muted-foreground mb-1 flex items-center justify-between font-medium">
                  <span>Source {i + 1}</span>
                  {source.similarity != null && (
                    <span className="text-muted-foreground/70 tabular-nums">
                      {(source.similarity * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
                <p className="text-foreground/80 line-clamp-3">
                  {source.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (state === "output-available" && toolName === "addResource") {
    return (
      <div className="text-muted-foreground flex items-center gap-1.5 py-1 text-xs">
        <BookPlus className="h-3.5 w-3.5" />
        <span>Added to knowledge base</span>
      </div>
    );
  }

  return null;
}

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useUser();
  const usersInitials = user?.firstName?.substring(0, 1);

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        message.role === "user" ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar
        className={cn(
          "h-8 w-8 shrink-0 border",
          message.role === "user" ? "border-primary/20" : "border-border/50",
        )}
      >
        {message.role === "user" && user?.imageUrl && (
          <AvatarImage src={user.imageUrl} alt="User's avatar" />
        )}
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            message.role === "user"
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {message.role === "user" ? (usersInitials ?? "U") : "R"}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[80%] overflow-hidden rounded-xl px-4 py-2.5 text-sm [overflow-wrap:anywhere]",
          message.role === "user"
            ? "bg-primary/10 text-foreground"
            : "border-border/30 bg-card/80 border",
        )}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text" && part.text.length > 0) {
            if (message.role === "user") {
              return (
                <div
                  key={`text-${index}`}
                  className="leading-relaxed whitespace-pre-wrap"
                >
                  {part.text}
                </div>
              );
            }
            return (
              <div key={`text-${index}`} className="prose-chat">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {part.text}
                </ReactMarkdown>
              </div>
            );
          }

          if (isToolUIPart(part)) {
            return <ToolInvocationPart key={`tool-${index}`} part={part} />;
          }

          return null;
        })}
      </div>
    </div>
  );
}
