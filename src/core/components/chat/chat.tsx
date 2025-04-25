"use client";

import type { Message } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { cn } from "@/core/lib/utils";

interface ChatProps {
  initialMessages?: Message[];
  className?: string;
  maxSteps?: number;
}

export default function Chat({
  initialMessages = [],
  className = "",
  maxSteps = 3,
}: ChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ initialMessages, maxSteps });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
              {isLoading && (
                <div className="text-muted-foreground text-sm italic">
                  Processing...
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>
        {/* Input form - sticky at bottom */}
        <div className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 border-t backdrop-blur">
          <div className="p-4">
            <ChatInput
              input={input}
              isLoading={isLoading}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>

          {/* <ChatInput
          input={input}
          isLoading={isLoading}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
        /> */}
        </div>
      </div>
    </div>
  );
}
