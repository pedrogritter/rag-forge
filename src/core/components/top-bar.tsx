"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/core/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/core/components/ui/sheet";
import { Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SideBarMenu } from "@/core/components/side-bar-menu";
import { useTheme } from "next-themes";
import { useSidebarStore } from "@/core/hooks/use-sidebar-store";
import { useThemeConfigStore } from "@/core/hooks/use-theme-config";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { isOpen: isSidebarOpen, toggleSidebar } = useSidebarStore();
  const { brandName } = useThemeConfigStore();
  const { isSignedIn } = useUser();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="border-border/50 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl">
      <div className="flex h-12 w-full items-center justify-between px-3">
        <div className="flex items-center">
          {/* Sidebar Toggle Button (Desktop) */}
          {isSignedIn && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground mr-1 hidden h-8 w-8 md:inline-flex"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Sidebar Menu Trigger (Mobile) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 h-8 w-8 md:hidden"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SideBarMenu />
            </SheetContent>
          </Sheet>

          {/* Logo and App Name */}
          <Link href="/" className="flex items-center gap-2 pl-2">
            <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-md shadow-[0_0_8px_var(--rf-accent-subtle)]">
              <span className="text-primary-foreground text-[10px] font-black">
                R
              </span>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              {brandName}
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Session Info / Auth */}
          {!isSignedIn ? (
            <SignInButton>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 cursor-pointer px-4 text-xs font-semibold"
              >
                Sign in
              </Button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </div>
      </div>
    </header>
  );
}
