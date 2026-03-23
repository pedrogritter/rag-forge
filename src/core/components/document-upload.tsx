"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/core/lib/utils";
import { Upload, FileText, Loader2, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

const SUPPORTED_EXTENSIONS = [".pdf", ".md", ".mdx", ".txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface UploadResult {
  filename: string;
  chunksProcessed: number;
  embeddingsCount: number;
}

export function DocumentUpload({ className }: { className?: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File exceeds 10 MB limit.";
    }
    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as
        | { success: true; filename: string; chunksProcessed: number; embeddingsCount: number }
        | { error: true; message: string };

      if (!res.ok || "error" in data) {
        toast.error("message" in data ? data.message : "Upload failed");
        return;
      }

      if ("success" in data) {
        setResult({
          filename: data.filename,
          chunksProcessed: data.chunksProcessed,
          embeddingsCount: data.embeddingsCount,
        });
        toast.success(
          `Processed ${data.filename}: ${data.embeddingsCount} embeddings created`,
        );
      }
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void uploadFile(file);
    },
    [uploadFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void uploadFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [uploadFile],
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_EXTENSIONS.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <>
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Processing document...
            </p>
          </>
        ) : (
          <>
            <Upload className="text-muted-foreground h-8 w-8" />
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop a file or click to upload
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                PDF, Markdown, or Text — up to 10 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-muted flex items-start gap-3 rounded-lg border p-3">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
          <div className="min-w-0 flex-1 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-medium">{result.filename}</span>
            </div>
            <p className="text-muted-foreground mt-0.5">
              {result.chunksProcessed} chunks &middot; {result.embeddingsCount}{" "}
              embeddings
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResult(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
