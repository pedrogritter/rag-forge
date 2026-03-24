"use client";

import React from "react";
import { cn } from "@/core/lib/utils";
import { useSidebarStore } from "@/core/hooks/use-sidebar-store";
import { TopBar } from "./top-bar";
import { SideBarMenu } from "./side-bar-menu";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isOpen: isSidebarOpen } = useSidebarStore();

  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <TopBar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "border-border/50 bg-card/50 fixed top-12 left-0 z-30 h-[calc(100vh-3rem)] border-r backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isSidebarOpen ? "w-90" : "w-[52px]",
            "hidden md:block",
          )}
        >
          <SideBarMenu />
        </aside>

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "md:ml-[52px]",
            isSidebarOpen && "md:ml-72",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
