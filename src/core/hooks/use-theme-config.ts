"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  themeConfig,
  type ColorPreset,
  type FontFamily,
} from "@/config/theme.config";

interface ThemeConfigState {
  brandName: string;
  colorPreset: ColorPreset;
  fontFamily: FontFamily;
  setBrandName: (name: string) => void;
  setColorPreset: (preset: ColorPreset) => void;
  setFontFamily: (font: FontFamily) => void;
  reset: () => void;
}

export const useThemeConfigStore = create<ThemeConfigState>()(
  persist(
    (set) => ({
      brandName: themeConfig.brandName,
      colorPreset: themeConfig.colorPreset,
      fontFamily: themeConfig.fontFamily,
      setBrandName: (name) => set({ brandName: name }),
      setColorPreset: (preset) => set({ colorPreset: preset }),
      setFontFamily: (font) => set({ fontFamily: font }),
      reset: () =>
        set({
          brandName: themeConfig.brandName,
          colorPreset: themeConfig.colorPreset,
          fontFamily: themeConfig.fontFamily,
        }),
    }),
    { name: "ragforge-theme" },
  ),
);
