"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { modelConfig } from "@/config/model.config";

interface SettingsState {
  /** Generate LLM-powered suggestion chips from the knowledge base (uses tokens). */
  suggestionsEnabled: boolean;
  setSuggestionsEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      suggestionsEnabled: modelConfig.suggestionsEnabled,
      setSuggestionsEnabled: (enabled) => set({ suggestionsEnabled: enabled }),
      reset: () => set({ suggestionsEnabled: modelConfig.suggestionsEnabled }),
    }),
    { name: "ragforge-settings" },
  ),
);
