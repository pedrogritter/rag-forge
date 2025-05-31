"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Loader2 } from "lucide-react";
import { cn } from "@/core/lib/utils";

export default function Chat({
  initialMessages = [],
  className = "",
  maxSteps = 3,
}) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    error,
    reload,
  } = useChat({ initialMessages, maxSteps });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div
      className={cn("relative flex h-[calc(100vh-3.5rem)] flex-col", className)}
    >
      <div className="absolute inset-0 flex flex-col">
        <div className="relative flex-1">
          <ScrollArea className="absolute inset-0">
            <div className="flex flex-col gap-4 p-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {(status === "submitted" || status === "streaming") && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm italic">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        <div className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 border-t backdrop-blur">
          <div className="p-4">
            <ChatInput
              input={input}
              isLoading={status === "submitted" || status === "streaming"}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              disabled={status !== "ready"}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-500">
                <span>Something went wrong.</span>
                <button
                  type="button"
                  className="cursor-pointer underline"
                  onClick={() => reload}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
