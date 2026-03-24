import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Separator } from "@/core/components/ui/separator";
import {
  Upload,
  MessageSquare,
  FileText,
  Settings,
  Keyboard,
  AlertTriangle,
} from "lucide-react";

interface FaqSection {
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

const faqSections: FaqSection[] = [
  {
    icon: Upload,
    title: "Getting Started",
    content: (
      <ol className="text-muted-foreground list-inside list-decimal space-y-2 text-sm leading-relaxed">
        <li>
          <strong>Upload documents</strong> — Use the drag-and-drop area in the
          sidebar or run the CLI command{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
            pnpm extractPDFs
          </code>{" "}
          for batch ingestion.
        </li>
        <li>
          <strong>Start chatting</strong> — Click &quot;New Chat&quot; and ask a
          question. The assistant searches your knowledge base and responds with
          grounded answers.
        </li>
        <li>
          <strong>Review sources</strong> — Expand the &quot;Found sources&quot;
          panel below any answer to see which chunks were used.
        </li>
      </ol>
    ),
  },
  {
    icon: MessageSquare,
    title: "What Can I Ask?",
    content: (
      <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
        <p>
          The assistant answers questions using{" "}
          <strong>Retrieval-Augmented Generation (RAG)</strong>. It searches
          your uploaded documents for relevant information and bases its
          responses solely on what it finds.
        </p>
        <p>
          If your question falls outside the knowledge base, the assistant will
          let you know rather than guessing.
        </p>
      </div>
    ),
  },
  {
    icon: FileText,
    title: "Supported File Types",
    content: (
      <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
        <li>
          <strong>PDF</strong> — extracted page-by-page with metadata (filename,
          page number)
        </li>
        <li>
          <strong>Markdown</strong> —{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">.md</code>,{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">.mdx</code> —
          heading-aware chunking for better context
        </li>
        <li>
          <strong>Plain text</strong> —{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">.txt</code>,{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">.text</code>
        </li>
      </ul>
    ),
  },
  {
    icon: Settings,
    title: "How to Customize",
    content: (
      <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
        <p>RAG Forge is designed to be forked and configured:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>System prompt</strong> — editable from Settings or in{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              src/config/assistant.config.ts
            </code>
          </li>
          <li>
            <strong>Model &amp; provider</strong> — switch between OpenAI,
            Anthropic, or Google from Settings or{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              src/config/model.config.ts
            </code>
          </li>
          <li>
            <strong>Branding &amp; theme</strong> — color presets, brand name,
            and fonts from Settings or{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              src/config/theme.config.ts
            </code>
          </li>
          <li>
            <strong>Embedding &amp; search</strong> — model, dimensions, and
            search parameters in{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              src/config/vector.config.ts
            </code>
          </li>
        </ul>
      </div>
    ),
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    content: (
      <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
        <li>
          <kbd className="bg-muted rounded border px-1.5 py-0.5 text-xs font-medium">
            Enter
          </kbd>{" "}
          — Send message
        </li>
        <li>
          <kbd className="bg-muted rounded border px-1.5 py-0.5 text-xs font-medium">
            Shift + Enter
          </kbd>{" "}
          — New line in the message input
        </li>
      </ul>
    ),
  },
  {
    icon: AlertTriangle,
    title: "Troubleshooting",
    content: (
      <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm leading-relaxed">
        <li>
          <strong>No API key configured</strong> — Set the environment variable
          for your chosen provider (
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
            OPENAI_API_KEY
          </code>
          ,{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
            ANTHROPIC_API_KEY
          </code>
          , or{" "}
          <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
            GOOGLE_GENERATIVE_AI_API_KEY
          </code>
          ).
        </li>
        <li>
          <strong>Empty responses</strong> — Make sure you have uploaded
          documents to the knowledge base. The assistant only answers from
          indexed content.
        </li>
        <li>
          <strong>Upload failures</strong> — Files must be under 10 MB.
          Supported formats: PDF, MD, MDX, TXT.
        </li>
        <li>
          <strong>Rate limit errors (429)</strong> — Wait a minute and try
          again. The default limit is 20 messages per minute.
        </li>
      </ul>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Help &amp; FAQ</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Common questions about using RAG Forge and getting the most out of
          your knowledge base assistant.
        </p>
      </div>

      <Separator className="opacity-50" />

      {faqSections.map((section) => (
        <Card key={section.title} className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <section.icon className="h-4 w-4" />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>{section.content}</CardContent>
        </Card>
      ))}
    </div>
  );
}
