"use client";

import type { Message } from "ai";
import { useChat } from "@ai-sdk/react";
import { use, useEffect, useRef } from "react";

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
    <div className={`flex h-full w-full flex-col ${className}`}>
      <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mb-4 flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-5 rounded-lg p-4 whitespace-pre-wrap ${message.role === "user" ? "ml-auto max-w-[80%] bg-blue-50" : "max-w-[80%] bg-gray-200"}`}
          >
            <div className="mb-1 text-sm font-bold text-gray-500">
              {message.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="text-gray-800">
              {message.content.length > 0 ? (
                message.content
              ) : (
                <span className="font-light text-gray-500 italic">
                  {"Calling tool:" + message.toolInvocations?.[0]?.toolName}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Is Loading Status */}
        {isLoading && (
          <div className="max-w-[80%] rounded-lg bg-gray-50 p-4 font-light text-gray-500 italic">
            Processing...
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      {/* User Input Form */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 border-t border-gray-200 bg-white p-4"
      >
        <div className="relative">
          <input
            className="w-full rounded-lg border border-gray-300 p-3 pr-12 pl-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={input}
            placeholder="Type your message"
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-blue-500 disabled:text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
