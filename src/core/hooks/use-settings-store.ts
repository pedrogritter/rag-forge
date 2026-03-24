"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { modelConfig } from "@/config/model.config";

interface SettingsState {
  /** Generate LLM-powered suggestion chips from the knowledge base (uses tokens). */
  suggestionsEnabled: boolean;
  /** Custom system prompt. Empty string = use default from assistantConfig. */
  systemPrompt: string;
  /** Temperature override. -1 = use default from modelConfig. */
  temperature: number;
  /** Provider override. Empty string = use default from modelConfig. */
  provider: string;
  /** Model override. Empty string = use default from modelConfig. */
  model: string;
  setSuggestionsEnabled: (enabled: boolean) => void;
  setSystemPrompt: (prompt: string) => void;
  setTemperature: (temp: number) => void;
  setProvider: (provider: string) => void;
  setModel: (model: string) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      suggestionsEnabled: modelConfig.suggestionsEnabled,
      systemPrompt: "",
      temperature: -1,
      provider: "",
      model: "",
      setSuggestionsEnabled: (enabled) => set({ suggestionsEnabled: enabled }),
      setSystemPrompt: (prompt) =>
        set({ systemPrompt: prompt.slice(0, 2000) }),
      setTemperature: (temp) => set({ temperature: temp }),
      setProvider: (provider) => set({ provider }),
      setModel: (model) => set({ model }),
      reset: () =>
        set({
          suggestionsEnabled: modelConfig.suggestionsEnabled,
          systemPrompt: "",
          temperature: -1,
          provider: "",
          model: "",
        }),
    }),
    { name: "ragforge-settings" },
  ),
);
