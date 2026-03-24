"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemeConfigStore } from "@/core/hooks/use-theme-config";
import { colorPresets } from "@/config/theme-presets";

const FONT_GEIST =
  "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif";
const FONT_SYSTEM = "system-ui, -apple-system, sans-serif";

const fontMap: Record<string, string> = {
  geist: FONT_GEIST,
  system: FONT_SYSTEM,
};

/**
 * Reads the active color preset + font from the Zustand theme store
 * and applies the matching CSS variable overrides to <html>.
 * Must be rendered inside next-themes' <ThemeProvider>.
 */
export function ThemeConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colorPreset, fontFamily } = useThemeConfigStore();
  const { resolvedTheme } = useTheme();

  // Apply color preset CSS variables
  useEffect(() => {
    const preset = colorPresets[colorPreset];
    if (!preset) return;

    const vars = resolvedTheme === "dark" ? preset.dark : preset.light;
    const root = document.documentElement;

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }

    return () => {
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
      }
    };
  }, [colorPreset, resolvedTheme]);

  // Apply font family
  useEffect(() => {
    const root = document.documentElement;
    const value = fontMap[fontFamily] ?? FONT_GEIST;
    root.style.setProperty("--font-sans", value);

    return () => {
      root.style.removeProperty("--font-sans");
    };
  }, [fontFamily]);

  return <>{children}</>;
}
