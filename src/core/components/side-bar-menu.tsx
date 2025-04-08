"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/core/components/ui/button";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { Separator } from "@/core/components/ui/separator";
import {
  Home,
  Settings,
  HelpCircle,
  Folder,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useSidebarStore } from "@/core/hooks/use-sidebar-store";
import { cn } from "@/core/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

// Mock Chat History Data
const mockChatHistory: NavItem[] = [
  { href: "/chat/1", label: "Introduction to RAG", icon: MessageSquare },
  { href: "/chat/2", label: "Vector Database Setup", icon: MessageSquare },
  { href: "/chat/3", label: "Agent Configuration Tips", icon: MessageSquare },
];

const mainNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: Folder },
];

const secondaryNavItems: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
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
          >
            <Plus className={cn("h-4 w-4", isSidebarOpen && "mr-2")} />
            {isSidebarOpen && <span>New Chat</span>}
            <span className={cn(!isSidebarOpen && "sr-only")}>New Chat</span>
          </Button>
        </div>

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
          <SidebarNav items={mockChatHistory} isCollapsed={!isSidebarOpen} />
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
