/**
 * Tests for Zustand settings & theme stores.
 *
 * Both stores use zustand/persist with localStorage. In a Node test
 * environment we skip persistence and test the pure state logic.
 */

// Mock config modules before importing stores
jest.mock("@/config/model.config", () => ({
  modelConfig: { suggestionsEnabled: false },
}));
jest.mock("@/config/theme.config", () => ({
  themeConfig: {
    brandName: "RAG Forge",
    colorPreset: "slate",
    fontFamily: "geist",
  },
}));

// Zustand stores import fine in Node — the `"use client"` directive is
// ignored by ts-jest. Persistence will be a no-op without localStorage.
import { useSettingsStore } from "./use-settings-store";
import { useThemeConfigStore } from "./use-theme-config";

describe("useSettingsStore", () => {
  beforeEach(() => {
    // Reset to defaults before each test
    useSettingsStore.getState().reset();
  });

  it("has correct default values", () => {
    const state = useSettingsStore.getState();
    expect(state.suggestionsEnabled).toBe(false);
    expect(state.systemPrompt).toBe("");
    expect(state.temperature).toBe(-1);
    expect(state.provider).toBe("");
    expect(state.model).toBe("");
  });

  it("sets suggestionsEnabled", () => {
    useSettingsStore.getState().setSuggestionsEnabled(true);
    expect(useSettingsStore.getState().suggestionsEnabled).toBe(true);

    useSettingsStore.getState().setSuggestionsEnabled(false);
    expect(useSettingsStore.getState().suggestionsEnabled).toBe(false);
  });

  it("sets system prompt and truncates at 2000 chars", () => {
    useSettingsStore.getState().setSystemPrompt("You are a helpful bot.");
    expect(useSettingsStore.getState().systemPrompt).toBe(
      "You are a helpful bot.",
    );

    // Test truncation
    const longPrompt = "x".repeat(3000);
    useSettingsStore.getState().setSystemPrompt(longPrompt);
    expect(useSettingsStore.getState().systemPrompt).toHaveLength(2000);
  });

  it("sets temperature", () => {
    useSettingsStore.getState().setTemperature(0.7);
    expect(useSettingsStore.getState().temperature).toBe(0.7);
  });

  it("sets provider", () => {
    useSettingsStore.getState().setProvider("anthropic");
    expect(useSettingsStore.getState().provider).toBe("anthropic");
  });

  it("sets model", () => {
    useSettingsStore.getState().setModel("gpt-4o");
    expect(useSettingsStore.getState().model).toBe("gpt-4o");
  });

  it("resets all values to defaults", () => {
    useSettingsStore.getState().setSuggestionsEnabled(true);
    useSettingsStore.getState().setSystemPrompt("custom");
    useSettingsStore.getState().setTemperature(0.9);
    useSettingsStore.getState().setProvider("google");
    useSettingsStore.getState().setModel("gemini-pro");

    useSettingsStore.getState().reset();

    const state = useSettingsStore.getState();
    expect(state.suggestionsEnabled).toBe(false);
    expect(state.systemPrompt).toBe("");
    expect(state.temperature).toBe(-1);
    expect(state.provider).toBe("");
    expect(state.model).toBe("");
  });
});

describe("useThemeConfigStore", () => {
  beforeEach(() => {
    useThemeConfigStore.getState().reset();
  });

  it("has correct default values", () => {
    const state = useThemeConfigStore.getState();
    expect(state.brandName).toBe("RAG Forge");
    expect(state.colorPreset).toBe("slate");
    expect(state.fontFamily).toBe("geist");
  });

  it("sets brand name", () => {
    useThemeConfigStore.getState().setBrandName("My App");
    expect(useThemeConfigStore.getState().brandName).toBe("My App");
  });

  it("sets color preset", () => {
    useThemeConfigStore.getState().setColorPreset("violet");
    expect(useThemeConfigStore.getState().colorPreset).toBe("violet");
  });

  it("sets font family", () => {
    useThemeConfigStore.getState().setFontFamily("system");
    expect(useThemeConfigStore.getState().fontFamily).toBe("system");
  });

  it("resets all values to defaults", () => {
    useThemeConfigStore.getState().setBrandName("Custom");
    useThemeConfigStore.getState().setColorPreset("rose");
    useThemeConfigStore.getState().setFontFamily("system");

    useThemeConfigStore.getState().reset();

    const state = useThemeConfigStore.getState();
    expect(state.brandName).toBe("RAG Forge");
    expect(state.colorPreset).toBe("slate");
    expect(state.fontFamily).toBe("geist");
  });
});
