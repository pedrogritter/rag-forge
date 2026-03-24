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
import { MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useSettingsStore } from "@/core/hooks/use-settings-store";
import { STATIC_TIPS } from "@/config/assistant.config";

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

  const { suggestionsEnabled } = useSettingsStore();

  const { data: dynamicSuggestions } = api.resources.sampleTopics.useQuery(
    undefined,
    { enabled: messages.length === 0 && suggestionsEnabled },
  );

  const suggestions = suggestionsEnabled ? dynamicSuggestions : STATIC_TIPS;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    void sendMessage({ text: input });
    setInput("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div
      className={cn("relative flex h-[calc(100vh-3rem)] flex-col", className)}
    >
      <div className="absolute inset-0 flex flex-col">
        <div className="relative flex-1">
          <ScrollArea className="absolute inset-0">
            <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-6 pb-4">
              {messages.length === 0 && (
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                    <MessageSquare className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Start a conversation</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Ask anything about your knowledge base.
                    </p>
                  </div>
                  {suggestions && suggestions.length > 0 && (
                    <div className="mt-4 flex max-w-md flex-wrap justify-center gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="border-border/50 bg-card/80 text-muted-foreground hover:bg-accent/50 hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors"
                          onClick={() => {
                            void sendMessage({ text: suggestion });
                          }}
                        >
                          <Sparkles className="h-3 w-3 shrink-0 opacity-60" />
                          <span className="truncate">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {status === "submitted" && (
                <div className="text-muted-foreground flex items-center gap-2.5 px-1 text-sm">
                  <div className="flex gap-1">
                    <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
                    <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
                    <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
                  </div>
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        <div className="border-border/50 bg-background/80 supports-[backdrop-filter]:bg-background/60 border-t shadow-[0_-1px_12px_oklch(0_0_0/8%)] backdrop-blur-xl">
          <div className="mx-auto max-w-2xl px-4 py-3">
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
