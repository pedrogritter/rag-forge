"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/core/components/ui/button";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { Separator } from "@/core/components/ui/separator";
import {
  Home,
  Settings,
  MessageSquare,
  Plus,
  Trash2,
  Database,
  HelpCircle,
} from "lucide-react";
import { useSidebarStore } from "@/core/hooks/use-sidebar-store";
import { cn } from "@/core/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { DocumentUpload } from "./document-upload";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const mainNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard/resources", label: "Knowledge Base", icon: Database },
];

const secondaryNavItems: NavItem[] = [
  { href: "/dashboard/faq", label: "Help & FAQ", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NavItem[];
  isCollapsed: boolean;
}

function SidebarNav({ className, items, isCollapsed }: SidebarNavProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "text-muted-foreground hover:bg-accent/50 hover:text-foreground h-8 w-full justify-start",
            isCollapsed ? "justify-center px-2" : "px-3",
          )}
          asChild
          disabled={item.disabled}
        >
          <Link href={item.href} title={isCollapsed ? item.label : undefined}>
            <item.icon
              className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2")}
            />
            <span className={cn("text-sm", isCollapsed && "sr-only")}>
              {item.label}
            </span>
          </Link>
        </Button>
      ))}
    </div>
  );
}

export function SideBarMenu() {
  const { isOpen: isSidebarOpen } = useSidebarStore();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const utils = api.useUtils();

  const { data: chatData, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.chats.list.useInfiniteQuery(
      { userId: user?.id ?? "" },
      {
        enabled: !!user?.id,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
    );

  const chatList = chatData?.pages.flatMap((p) => p.items);

  const createChat = api.chats.create.useMutation({
    onSuccess: (data) => {
      void utils.chats.list.invalidate();
      router.push(`/dashboard/c/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to create chat");
    },
  });

  const deleteChat = api.chats.delete.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await utils.chats.list.cancel();
      // Snapshot current data for rollback
      const previousData = utils.chats.list.getInfiniteData({
        userId: user?.id ?? "",
      });
      // Optimistically remove the chat from the infinite list
      utils.chats.list.setInfiniteData(
        { userId: user?.id ?? "" },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((c) => c.id !== variables.id),
            })),
          };
        },
      );
      return { previousData };
    },
    onSuccess: (_data, variables) => {
      toast.success("Chat deleted");
      if (pathname === `/dashboard/c/${variables.id}`) {
        router.push("/dashboard");
      }
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous data on failure
      if (context?.previousData) {
        utils.chats.list.setInfiniteData(
          { userId: user?.id ?? "" },
          context.previousData,
        );
      }
      toast.error("Failed to delete chat");
    },
    onSettled: () => {
      void utils.chats.list.invalidate();
    },
  });

  const handleNewChat = () => {
    if (!user?.id) return;
    createChat.mutate({ userId: user.id });
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        isSidebarOpen ? "px-2" : "items-center px-1",
      )}
    >
      <ScrollArea className="h-full flex-grow py-3">
        {/* New Chat Button */}
        <div className={cn("pb-2", isSidebarOpen ? "px-1" : "px-0")}>
          <Button
            variant="outline"
            size={isSidebarOpen ? "default" : "icon"}
            className={cn(
              "border-border/50 text-muted-foreground hover:bg-accent/50 hover:text-foreground w-full bg-transparent text-sm",
              isSidebarOpen && "h-8 justify-start px-3",
            )}
            onClick={handleNewChat}
            disabled={createChat.isPending}
          >
            <Plus className={cn("h-4 w-4", isSidebarOpen && "mr-2")} />
            <span className={cn(!isSidebarOpen && "sr-only")}>New Chat</span>
          </Button>
        </div>

        {/* Document Upload — visible only when sidebar is open */}
        {isSidebarOpen && (
          <div className="px-1 pb-2">
            <DocumentUpload />
          </div>
        )}

        {/* Chat History */}
        <div className={cn("pb-2", isSidebarOpen ? "px-1" : "px-0")}>
          <h2
            className={cn(
              "text-muted-foreground/70 mb-1.5 text-[11px] font-semibold tracking-wider uppercase",
              isSidebarOpen ? "px-3" : "sr-only",
            )}
          >
            History
          </h2>
          <div className="flex flex-col gap-0.5">
            {chatList?.map((chat) => {
              const isActive = pathname === `/dashboard/c/${chat.id}`;
              return (
                <div key={chat.id} className="group relative">
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-8 w-full justify-start overflow-hidden",
                      isActive
                        ? "bg-accent/60 text-foreground shadow-[inset_2px_0_0_var(--rf-accent)]"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                      isSidebarOpen ? "px-3 pr-8" : "justify-center px-2",
                    )}
                    asChild
                  >
                    <Link
                      href={`/dashboard/c/${chat.id}`}
                      title={chat.title ?? "Untitled"}
                      className="min-w-0"
                    >
                      <MessageSquare
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSidebarOpen && "mr-2",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          isSidebarOpen ? "truncate" : "sr-only",
                        )}
                      >
                        {chat.title ?? "Untitled"}
                      </span>
                    </Link>
                  </Button>
                  {isSidebarOpen && (
                    <button
                      type="button"
                      className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 absolute top-1/2 right-1.5 hidden -translate-y-1/2 cursor-pointer rounded-md p-1 transition-colors group-hover:block"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteChat.mutate({ id: chat.id });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            {hasNextPage && isSidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground mt-1 h-7 w-full text-xs"
                onClick={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-3 opacity-50" />

        {/* Main Nav */}
        <div className={cn("pb-2", isSidebarOpen ? "px-1" : "px-0")}>
          <h2
            className={cn(
              "text-muted-foreground/70 mb-1.5 text-[11px] font-semibold tracking-wider uppercase",
              isSidebarOpen ? "px-3" : "sr-only",
            )}
          >
            Navigate
          </h2>
          <SidebarNav items={mainNavItems} isCollapsed={!isSidebarOpen} />
        </div>
      </ScrollArea>

      {/* Footer Nav - Pushed to bottom */}
      <div className={cn("mt-auto pb-3", isSidebarOpen ? "px-1" : "px-0")}>
        <Separator className="mb-3 opacity-50" />
        <SidebarNav items={secondaryNavItems} isCollapsed={!isSidebarOpen} />
      </div>
    </div>
  );
}
