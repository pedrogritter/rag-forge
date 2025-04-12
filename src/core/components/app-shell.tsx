"use client";

import React from "react";
import { cn } from "@/core/lib/utils";
import { useSidebarStore } from "@/core/hooks/use-sidebar-store";
import { TopBar } from "./top-bar";
// import { Footer } from "./footer";
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
            "fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] border-r transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-65" : "w-[52px]", // Width transitions
            "hidden md:block", // Hide on mobile, handled by Sheet
          )}
        >
          <SideBarMenu />
        </aside>

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            "md:ml-[52px]", // Default margin for collapsed sidebar
            isSidebarOpen && "md:ml-60", // Adjust margin when sidebar is open
          )}
        >
          {children}
        </main>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
