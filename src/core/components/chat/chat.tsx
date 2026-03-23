"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Loader2 } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { toast } from "sonner";

export default function Chat({
  id,
  initialMessages,
  className = "",
}: {
  id: string;
  initialMessages?: UIMessage[];
  className?: string;
}) {
  const { messages, sendMessage, regenerate, status, error } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // Send only the last message — server loads previous from DB
      prepareSendMessagesRequest({ messages, id }) {
        return { body: { message: messages[messages.length - 1], id } };
      },
    }),
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    void sendMessage({ text: input });
    setInput("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

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
              {status === "submitted" && (
                <div className="text-muted-foreground flex items-center gap-2 px-1 text-sm italic">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
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
                  onClick={() => void regenerate()}
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
