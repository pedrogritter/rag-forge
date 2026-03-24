export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1">
          <span className="bg-primary h-2 w-2 animate-pulse rounded-full" />
          <span className="bg-primary h-2 w-2 animate-pulse rounded-full [animation-delay:150ms]" />
          <span className="bg-primary h-2 w-2 animate-pulse rounded-full [animation-delay:300ms]" />
        </div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
