"use client";

import { useState } from "react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Separator } from "@/core/components/ui/separator";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/core/components/ui/sheet";
import { cn } from "@/core/lib/utils";
import { Database, FileText, File, Trash2, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

function ResourceTypeBadge({ type }: { type: "pdf" | "text" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
        type === "pdf"
          ? "bg-red-500/10 text-red-500 dark:bg-red-500/15 dark:text-red-400"
          : "bg-blue-500/10 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
      )}
    >
      {type === "pdf" ? (
        <FileText className="h-3 w-3" />
      ) : (
        <File className="h-3 w-3" />
      )}
      {type.toUpperCase()}
    </span>
  );
}

function ResourceDetail({ resourceId }: { resourceId: string }) {
  const { data, isLoading } = api.resources.byId.useQuery({ id: resourceId });

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading chunks...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-2">
      {data.chunks.length === 0 ? (
        <p className="text-muted-foreground text-xs">No chunks found.</p>
      ) : (
        <div className="space-y-2 pr-1">
          {data.chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="border-border/40 bg-muted/30 rounded-md border p-3 text-xs"
            >
              {(chunk.pageNumber != null || chunk.pageTitle) && (
                <div className="text-muted-foreground mb-1.5 font-medium">
                  {chunk.pageTitle && <span>{chunk.pageTitle}</span>}
                  {chunk.pageNumber != null && (
                    <span className="text-muted-foreground/70">
                      {chunk.pageTitle ? " — " : ""}Page {chunk.pageNumber}
                    </span>
                  )}
                </div>
              )}
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  const [selectedResource, setSelectedResource] = useState<{
    id: string;
    name: string;
    type: "pdf" | "text";
    chunksCount: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: resourceList, isLoading } = api.resources.list.useQuery();

  const deleteResource = api.resources.delete.useMutation({
    onMutate: async (variables) => {
      setDeletingId(variables.id);
      await utils.resources.list.cancel();
      const previous = utils.resources.list.getData();
      utils.resources.list.setData(undefined, (old) =>
        old ? old.filter((r) => r.id !== variables.id) : [],
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success("Resource deleted");
      if (selectedResource?.id === deletingId) setSelectedResource(null);
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        utils.resources.list.setData(undefined, context.previous);
      }
      toast.error("Failed to delete resource");
    },
    onSettled: () => {
      setDeletingId(null);
      void utils.resources.list.invalidate();
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View and manage your indexed documents and their chunks.
        </p>
      </div>

      <Separator className="opacity-50" />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        </div>
      ) : !resourceList || resourceList.length === 0 ? (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Database className="text-muted-foreground/50 h-10 w-10" />
            <div className="text-center">
              <p className="text-muted-foreground text-sm font-medium">
                No documents indexed
              </p>
              <p className="text-muted-foreground/70 mt-1 text-xs">
                Upload PDFs or text files using the sidebar to populate your
                knowledge base.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="text-muted-foreground/70 grid grid-cols-[1fr_72px_64px_64px_100px_36px] items-center gap-2 px-4 text-[11px] font-semibold tracking-wider uppercase">
            <span>Name</span>
            <span>Type</span>
            <span className="text-right">Pages</span>
            <span className="text-right">Chunks</span>
            <span className="text-right">Indexed</span>
            <span />
          </div>

          {resourceList.map((resource) => {
            return (
              <Card
                key={resource.id}
                className="border-border/50 bg-card/80 hover:border-border transition-colors"
              >
                <div
                  className="grid cursor-pointer grid-cols-[1fr_72px_64px_64px_100px_36px] items-center gap-2 px-4 py-2.5"
                  onClick={() =>
                    setSelectedResource({
                      id: resource.id,
                      name: resource.name,
                      type: resource.type,
                      chunksCount: resource.chunksCount,
                    })
                  }
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="truncate text-sm font-medium"
                      title={resource.name}
                    >
                      {resource.name}
                    </span>
                  </div>

                  <ResourceTypeBadge type={resource.type} />

                  <span className="text-muted-foreground text-right text-sm tabular-nums">
                    {resource.pageCount ?? "—"}
                  </span>

                  <span className="text-muted-foreground text-right text-sm tabular-nums">
                    {resource.chunksCount}
                  </span>

                  <span className="text-muted-foreground text-right text-xs tabular-nums">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 ml-auto cursor-pointer rounded-md p-1 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteResource.mutate({ id: resource.id });
                    }}
                    title="Delete resource"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Chunk detail sheet */}
      <Sheet
        open={!!selectedResource}
        onOpenChange={(open) => {
          if (!open) setSelectedResource(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedResource && (
                <ResourceTypeBadge type={selectedResource.type} />
              )}
              <span className="truncate">{selectedResource?.name}</span>
            </SheetTitle>
            <SheetDescription>
              {selectedResource?.chunksCount ?? 0} chunk
              {selectedResource?.chunksCount === 1 ? "" : "s"} indexed
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 px-4 pb-4">
            {selectedResource && (
              <ResourceDetail resourceId={selectedResource.id} />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
