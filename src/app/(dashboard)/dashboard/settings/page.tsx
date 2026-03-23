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
import { colorPresets, colorPresetKeys } from "@/config/theme-presets";
import type { FontFamily } from "@/config/theme.config";
import { cn } from "@/core/lib/utils";
import { Check, RotateCcw, Type } from "lucide-react";
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
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Customize the appearance of your RAG Forge instance. Changes are saved
          to your browser automatically.
        </p>
      </div>

      <Separator />

      {/* ── Color Preset ── */}
      <Card>
        <CardHeader>
          <CardTitle>Color Preset</CardTitle>
          <CardDescription>
            Choose a brand color theme. This changes the primary and accent
            colors across the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {colorPresetKeys.map((key) => {
              const preset = colorPresets[key];
              const isActive = key === colorPreset;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorPreset(key)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent text-muted-foreground hover:text-foreground",
                  )}
                  title={preset.label}
                >
                  <span
                    className="block h-4 w-4 shrink-0 rounded-full border"
                    style={{ backgroundColor: preset.swatch }}
                  />
                  {preset.label}
                  {isActive && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Font Family ── */}
      <Card>
        <CardHeader>
          <CardTitle>Font</CardTitle>
          <CardDescription>
            Select the font family used throughout the interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {fontOptions.map((opt) => {
              const isActive = opt.value === fontFamily;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFontFamily(opt.value)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Type className="h-3.5 w-3.5" />
                  {opt.label}
                  {isActive && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Brand Name ── */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Name</CardTitle>
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
              className="max-w-xs"
              maxLength={40}
            />
            <Button type="submit" size="sm">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* ── Reset ── */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
