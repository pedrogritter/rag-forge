import { Button } from "@/core/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { useRef, useCallback } from "react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export function ChatInput({
  input,
  isLoading,
  onSubmit,
  onChange,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading || disabled) return;
      const form = e.currentTarget.closest("form");
      if (form) form.requestSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask something..."
        disabled={isLoading || disabled}
        rows={1}
        style={{ maxHeight: "9rem" }}
        className={cn(
          "border-border/50 bg-card/80 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-primary/30 w-full resize-none overflow-y-auto rounded-xl border px-4 py-3 pr-12 text-sm shadow-sm focus:ring-1 focus:outline-none",
          (isLoading || disabled) && "cursor-not-allowed opacity-60",
        )}
      />
      <Button
        type="submit"
        size="icon"
        disabled={isLoading || disabled || !input.trim()}
        className={cn(
          "absolute top-1/2 right-1.5 h-8 w-8 -translate-y-1/2 rounded-lg transition-all",
          input.trim()
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground",
          (isLoading || disabled) && "cursor-not-allowed opacity-50",
        )}
      >
        <ArrowUp className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
