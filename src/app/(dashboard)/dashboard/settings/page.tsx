"use client";

import { type FormEvent } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Separator } from "@/core/components/ui/separator";
import { useThemeConfigStore } from "@/core/hooks/use-theme-config";
import { useSettingsStore } from "@/core/hooks/use-settings-store";
import { colorPresets, colorPresetKeys } from "@/config/theme-presets";
import type { FontFamily } from "@/config/theme.config";
import { cn } from "@/core/lib/utils";
import { Check, RotateCcw, Type, Sparkles } from "lucide-react";
import { toast } from "sonner";

const fontOptions: { value: FontFamily; label: string; sample: string }[] = [
  { value: "geist", label: "Geist Sans", sample: "font-sans" },
  { value: "system", label: "System UI", sample: "font-sans" },
];

export default function SettingsPage() {
  const {
    brandName,
    colorPreset,
    fontFamily,
    setBrandName,
    setColorPreset,
    setFontFamily,
    reset,
  } = useThemeConfigStore();

  const {
    suggestionsEnabled,
    setSuggestionsEnabled,
    reset: resetSettings,
  } = useSettingsStore();

  const handleBrandSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("brandName") as string).trim();
    if (name) {
      setBrandName(name);
      toast.success("Brand name updated");
    }
  };

  const handleReset = () => {
    reset();
    resetSettings();
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Customize the appearance of your RAG Forge instance. Changes are saved
          to your browser automatically.
        </p>
      </div>

      <Separator className="opacity-50" />

      {/* ── Color Preset ── */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Color Preset</CardTitle>
          <CardDescription>
            Choose a brand color theme. This changes the primary and accent
            colors across the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {colorPresetKeys.map((key) => {
              const preset = colorPresets[key];
              const isActive = key === colorPreset;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorPreset(key)}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all",
                    isActive
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-border hover:bg-accent/30 hover:text-foreground",
                  )}
                  title={preset.label}
                >
                  <span
                    className="block h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{ backgroundColor: preset.swatch }}
                  />
                  <span className="text-xs">{preset.label}</span>
                  {isActive && <Check className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Font Family ── */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Font</CardTitle>
          <CardDescription>
            Select the font family used throughout the interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {fontOptions.map((opt) => {
              const isActive = opt.value === fontFamily;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFontFamily(opt.value)}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all",
                    isActive
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-border hover:bg-accent/30 hover:text-foreground",
                  )}
                >
                  <Type className="h-3.5 w-3.5" />
                  <span className="text-xs">{opt.label}</span>
                  {isActive && <Check className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Brand Name ── */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Brand Name</CardTitle>
          <CardDescription>
            The name shown in the topbar and browser tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBrandSubmit} className="flex gap-2">
            <Input
              name="brandName"
              defaultValue={brandName}
              placeholder="RAG Forge"
              className="border-border/50 bg-background/50 max-w-xs"
              maxLength={40}
            />
            <Button type="submit" size="sm" className="h-9">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="opacity-50" />

      {/* ── Smart Suggestions ── */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Smart Suggestions</CardTitle>
          <CardDescription>
            When enabled, new chats show AI-generated suggestion chips based on
            your knowledge base. This uses a small amount of LLM tokens per
            cache refresh (every 5 minutes). When disabled, static tips are
            shown instead.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSuggestionsEnabled(!suggestionsEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                suggestionsEnabled ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  suggestionsEnabled ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {suggestionsEnabled
                ? "AI-powered suggestions"
                : "Static tips (no tokens used)"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Separator className="opacity-50" />

      {/* ── Reset ── */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="border-border/50 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-1.5 h-3 w-3" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
