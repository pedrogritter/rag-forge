"use client";

import { useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-3rem)] items-center justify-center p-4">
      <Card className="border-border/50 bg-card/80 w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="bg-destructive/10 rounded-xl p-3">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {error.message || "An unexpected error occurred."}
            </p>
            {error.digest && (
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <Button
            onClick={() => reset()}
            variant="outline"
            className="border-border/50"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
