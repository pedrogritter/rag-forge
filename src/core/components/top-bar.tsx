"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/core/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/core/components/ui/sheet";
import { Menu, Sun, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SideBarMenu } from "@/core/components/side-bar-menu";
import { useTheme } from "next-themes";
import { useSidebarStore } from "@/core/hooks/use-sidebar-store";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { isOpen: isSidebarOpen, toggleSidebar } = useSidebarStore();
  const { isSignedIn } = useUser();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-12 w-full flex-row items-center justify-between px-2">
        {/* Sidebar Toggle Button (Desktop) */}
        {isSignedIn && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 hidden md:inline-flex"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5 transition-transform duration-300 ease-in-out" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 transition-transform duration-300 ease-in-out" />
            )}
          </Button>
        )}

        {/* Sidebar Menu Trigger (Mobile) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SideBarMenu />
          </SheetContent>
        </Sheet>

        {/* Logo and App Name */}
        <Link href="/" className="mr-6 flex items-center space-x-2 pl-4">
          {/* Placeholder for a real logo */}
          {/* <Icons.logo className="h-6 w-6" /> Replace with actual logo icon */}
          <span className="font-bold sm:inline-block">RAG Forge</span>
        </Link>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-end space-x-2 pr-4">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Session Info / Auth */}
          <SignedOut>
            <Button className="cursor-pointer bg-white/70 p-4 align-middle hover:bg-white/80">
              <SignInButton />
            </Button>
            {/* <SignUpButton /> */}
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
