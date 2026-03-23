"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/core/components/ui/button";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { Separator } from "@/core/components/ui/separator";
import {
  Home,
  Settings,
  Folder,
  MessageSquare,
  Plus,
  Trash2,
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
  { href: "/projects", label: "Projects", icon: Folder },
];

const secondaryNavItems: NavItem[] = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NavItem[];
  isCollapsed: boolean;
}

function SidebarNav({ className, items, isCollapsed }: SidebarNavProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "h-9 w-full justify-start",
            isCollapsed ? "justify-center px-2" : "",
          )}
          asChild
          disabled={item.disabled}
        >
          <Link href={item.href} title={isCollapsed ? item.label : undefined}>
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            <span className={cn(isCollapsed && "sr-only")}>{item.label}</span>
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
  const utils = api.useUtils();

  const { data: chatList } = api.chats.list.useQuery(
    { userId: user?.id ?? "" },
    { enabled: !!user?.id },
  );

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
    onSuccess: () => {
      void utils.chats.list.invalidate();
      toast.success("Chat deleted");
    },
    onError: () => {
      toast.error("Failed to delete chat");
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
        isSidebarOpen ? "px-3" : "items-center px-1",
      )}
    >
      <ScrollArea className="h-full flex-grow py-4">
        {/* New Chat Button */}
        <div className={cn("pb-2", isSidebarOpen ? "px-1" : "px-0")}>
          <Button
            variant="outline"
            size={isSidebarOpen ? "default" : "icon"}
            className="w-full"
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
              "mb-2 text-lg font-semibold tracking-tight",
              isSidebarOpen ? "px-3" : "sr-only",
            )}
          >
            History
          </h2>
          <div className="flex flex-col gap-1">
            {chatList?.map((chat) => (
              <div key={chat.id} className="group relative">
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 w-full justify-start",
                    isSidebarOpen ? "pr-8" : "justify-center px-2",
                  )}
                  asChild
                >
                  <Link
                    href={`/dashboard/c/${chat.id}`}
                    title={
                      isSidebarOpen ? undefined : (chat.title ?? "Untitled")
                    }
                  >
                    <MessageSquare
                      className={cn(
                        "h-4 w-4",
                        !isSidebarOpen && "mr-0",
                        isSidebarOpen && "mr-2",
                      )}
                    />
                    <span
                      className={cn(isSidebarOpen ? "truncate" : "sr-only")}
                    >
                      {chat.title ?? "Untitled"}
                    </span>
                  </Link>
                </Button>
                {isSidebarOpen && (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive absolute top-1/2 right-1 hidden -translate-y-1/2 cursor-pointer group-hover:block"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteChat.mutate({ id: chat.id });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Main Nav */}
        <div className={cn("pb-2", isSidebarOpen ? "px-1" : "px-0")}>
          <h2
            className={cn(
              "mb-2 text-lg font-semibold tracking-tight",
              isSidebarOpen ? "px-3" : "sr-only",
            )}
          >
            Explore
          </h2>
          <SidebarNav items={mainNavItems} isCollapsed={!isSidebarOpen} />
        </div>
      </ScrollArea>

      {/* Footer Nav - Pushed to bottom */}
      <div className="mt-auto pb-4">
        <Separator className="my-4" />
        <SidebarNav items={secondaryNavItems} isCollapsed={!isSidebarOpen} />
      </div>
    </div>
  );
}
