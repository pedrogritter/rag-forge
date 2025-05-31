import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function ChatInput({
  input,
  isLoading,
  onSubmit,
  onChange,
  disabled = false,
}: ChatInputProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 border-t backdrop-blur"
    >
      <Input
        value={input}
        onChange={onChange}
        placeholder="Type your message..."
        disabled={isLoading || disabled}
        className={cn(
          "pr-12",
          "focus-visible:ring-1",
          "focus-visible:ring-offset-0",
        )}
      />
      <Button
        type="submit"
        size="icon"
        disabled={isLoading || disabled}
        className={cn(
          "absolute top-1 right-1 h-8 w-8",
          "bg-transparent hover:bg-transparent",
          (isLoading || disabled) && "cursor-not-allowed opacity-50",
        )}
      >
        <Send className="text-primary h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
