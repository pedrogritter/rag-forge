"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/core/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/core/components/ui/sheet";
import {
  Menu,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { SideBarMenu } from "@/core/components/side-bar-menu";
import { useTheme } from "next-themes";
import { useSidebarStore } from "@/core/hooks/use-sidebar-store";

// Placeholder Session Type (replace with actual NextAuth types)
interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
interface Session {
  user?: SessionUser;
}
interface UseSessionReturn {
  data: Session | null;
  status: "authenticated" | "unauthenticated" | "loading";
}

// Placeholder for session logic
const useSession = (): UseSessionReturn => {
  // Replace with actual useSession hook from next-auth when integrated
  return { data: null, status: "unauthenticated" }; // Example: unauthenticated
  // return { data: { user: { name: 'Test User', image: 'https://github.com/shadcn.png' } }, status: 'authenticated' }; // Example: authenticated
};

export function TopBar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const isAuthenticated = status === "authenticated";
  const { isOpen: isSidebarOpen, toggleSidebar } = useSidebarStore();

  const user = session?.user;

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Sidebar Toggle Button (Desktop) */}
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
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {/* Placeholder for a real logo */}
          {/* <Icons.logo className="h-6 w-6" /> Replace with actual logo icon */}
          <span className="font-bold sm:inline-block">
            RAG <span className="text-primary">Forge</span>
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-end space-x-2">
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
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? "User"}
                    />
                    <AvatarFallback>
                      {user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <User size={16} />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Optional: Add user info or settings link */}
                {/* <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={() => console.log("Sign out logic here")}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              onClick={() => console.log("Sign in logic here")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
