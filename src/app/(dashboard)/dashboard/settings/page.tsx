"use client";

import { type FormEvent, useEffect, useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/components/ui/tabs";
import { useThemeConfigStore } from "@/core/hooks/use-theme-config";
import { useSettingsStore } from "@/core/hooks/use-settings-store";
import { colorPresets, colorPresetKeys } from "@/config/theme-presets";
import { assistantConfig } from "@/config/assistant.config";
import { modelConfig } from "@/config/model.config";
import { vectorConfig } from "@/config/vector.config";
import type { FontFamily } from "@/config/theme.config";
import { cn } from "@/core/lib/utils";
import {
  Check,
  RotateCcw,
  Type,
  Sparkles,
  MessageSquareText,
  Thermometer,
  Cpu,
  Palette,
  Bot,
  MessageCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";

const fontOptions: { value: FontFamily; label: string; sample: string }[] = [
  { value: "geist", label: "Geist Sans", sample: "font-sans" },
  { value: "system", label: "System UI", sample: "font-sans" },
];

interface ProviderInfo {
  name: string;
  models: string[];
}

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
    systemPrompt,
    setSystemPrompt,
    temperature,
    setTemperature,
    provider,
    setProvider,
    model,
    setModel,
    topK,
    setTopK,
    similarityThreshold,
    setSimilarityThreshold,
    reset: resetSettings,
  } = useSettingsStore();

  const [availableProviders, setAvailableProviders] = useState<ProviderInfo[]>(
    [],
  );

  useEffect(() => {
    void fetch("/api/settings/providers")
      .then((r) => r.json() as Promise<ProviderInfo[]>)
      .then(setAvailableProviders)
      .catch(() => {
        // Best-effort — providers list will remain empty
      });
  }, []);

  const activeProvider = availableProviders.find(
    (p) => p.name === (provider || modelConfig.provider),
  );
  const modelOptions = activeProvider?.models ?? [];

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

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">
            <Palette className="mr-1.5 h-3.5 w-3.5" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Bot className="mr-1.5 h-3.5 w-3.5" />
            AI &amp; Model
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="retrieval">
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Retrieval
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════ Appearance ═══════════════ */}
        <TabsContent value="appearance" className="space-y-4">
          {/* Color Preset */}
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

          {/* Font Family */}
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

          {/* Brand Name */}
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
        </TabsContent>

        {/* ═══════════════ AI & Model ═══════════════ */}
        <TabsContent value="ai" className="space-y-4">
          {/* Provider & Model */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4" />
                Model &amp; Provider
              </CardTitle>
              <CardDescription>
                Select the AI provider and model. Only providers with configured
                API keys are shown.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableProviders.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Loading providers...
                </p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs font-medium">
                      Provider
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableProviders.map((p) => {
                        const isActive =
                          p.name === (provider || modelConfig.provider);
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setProvider(p.name);
                              setModel(p.models[0] ?? "");
                            }}
                            className={cn(
                              "flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all",
                              isActive
                                ? "border-primary/50 bg-primary/10 text-primary"
                                : "border-border/50 text-muted-foreground hover:border-border hover:bg-accent/30 hover:text-foreground",
                            )}
                          >
                            <span className="text-xs capitalize">{p.name}</span>
                            {isActive && <Check className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs font-medium">
                      Model
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {modelOptions.map((m) => {
                        const isActive = m === (model || modelConfig.model);
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setModel(m)}
                            className={cn(
                              "flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all",
                              isActive
                                ? "border-primary/50 bg-primary/10 text-primary"
                                : "border-border/50 text-muted-foreground hover:border-border hover:bg-accent/30 hover:text-foreground",
                            )}
                          >
                            <span className="font-mono text-xs">{m}</span>
                            {isActive && <Check className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Temperature */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Thermometer className="h-4 w-4" />
                Model Temperature
              </CardTitle>
              <CardDescription>
                Controls randomness. Lower values (0.0) are more deterministic,
                higher values (1.0) are more creative. Default:{" "}
                {modelConfig.temperature}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={
                    temperature >= 0 ? temperature : modelConfig.temperature
                  }
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="accent-primary h-2 flex-1 cursor-pointer"
                />
                <span className="text-foreground w-10 text-right text-sm font-medium tabular-nums">
                  {temperature >= 0
                    ? temperature.toFixed(1)
                    : `${modelConfig.temperature.toFixed(1)}`}
                </span>
                {temperature >= 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 text-xs"
                    onClick={() => {
                      setTemperature(-1);
                      toast.success("Temperature reset to default");
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquareText className="h-4 w-4" />
                System Prompt
              </CardTitle>
              <CardDescription>
                Override the default assistant instructions. Leave empty to use
                the built-in prompt. Max 2000 characters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder={assistantConfig.systemPrompt}
                rows={5}
                maxLength={2000}
                className="border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/50 w-full resize-y rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground/60 text-xs tabular-nums">
                  {systemPrompt.length} / 2000
                </span>
                {systemPrompt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 text-xs"
                    onClick={() => {
                      setSystemPrompt("");
                      toast.success("System prompt reset to default");
                    }}
                  >
                    Reset to default
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════ Chat ═══════════════ */}
        <TabsContent value="chat" className="space-y-4">
          {/* Smart Suggestions */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-base">Smart Suggestions</CardTitle>
              <CardDescription>
                When enabled, new chats show AI-generated suggestion chips based
                on your knowledge base. This uses a small amount of LLM tokens
                per cache refresh (every 5 minutes). When disabled, static tips
                are shown instead.
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
        </TabsContent>

        {/* ═══════════════ Retrieval ═══════════════ */}
        <TabsContent value="retrieval" className="space-y-4">
          {/* Top K */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-base">Top K Results</CardTitle>
              <CardDescription>
                Maximum number of knowledge base chunks retrieved per query.
                Higher values provide more context but may slow responses.
                Default: {vectorConfig.search.topK}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={topK >= 1 ? topK : vectorConfig.search.topK}
                  onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                  className="accent-primary h-2 flex-1 cursor-pointer"
                />
                <span className="text-foreground w-10 text-right text-sm font-medium tabular-nums">
                  {topK >= 1 ? topK : vectorConfig.search.topK}
                </span>
                {topK >= 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 text-xs"
                    onClick={() => {
                      setTopK(-1);
                      toast.success("Top K reset to default");
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Similarity Threshold */}
          <Card className="border-border/50 bg-card/80">
            <CardHeader>
              <CardTitle className="text-base">Similarity Threshold</CardTitle>
              <CardDescription>
                Minimum similarity score for results to be included. Lower
                values return more results but may include less relevant chunks.
                Default: {vectorConfig.search.similarityThreshold}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={
                    similarityThreshold >= 0
                      ? similarityThreshold
                      : vectorConfig.search.similarityThreshold
                  }
                  onChange={(e) =>
                    setSimilarityThreshold(parseFloat(e.target.value))
                  }
                  className="accent-primary h-2 flex-1 cursor-pointer"
                />
                <span className="text-foreground w-10 text-right text-sm font-medium tabular-nums">
                  {similarityThreshold >= 0
                    ? similarityThreshold.toFixed(2)
                    : vectorConfig.search.similarityThreshold.toFixed(2)}
                </span>
                {similarityThreshold >= 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 text-xs"
                    onClick={() => {
                      setSimilarityThreshold(-1);
                      toast.success("Similarity threshold reset to default");
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="opacity-50" />
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
