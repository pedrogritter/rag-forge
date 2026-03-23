import type { ColorPreset } from "./theme.config";

/**
 * Each preset overrides the core brand CSS variables.
 * Variables not listed fall through to the stylesheet defaults (globals.css).
 *
 * The `swatch` string is used by the settings UI to render a preview circle.
 */
export interface PresetDefinition {
  label: string;
  /** Display color for the preset swatch (any valid CSS color). */
  swatch: string;
  /** CSS variable overrides applied when the :root is in light mode. */
  light: Record<string, string>;
  /** CSS variable overrides applied when the :root is in dark mode. */
  dark: Record<string, string>;
}

/**
 * Slate is the baseline — empty overrides mean the CSS defaults from
 * globals.css apply unchanged.
 */
export const colorPresets: Record<ColorPreset, PresetDefinition> = {
  slate: {
    label: "Slate",
    swatch: "oklch(0.554 0.046 257.417)",
    light: {},
    dark: {},
  },
  blue: {
    label: "Blue",
    swatch: "oklch(0.546 0.245 262.881)",
    light: {
      "--primary": "oklch(0.546 0.245 262.881)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.546 0.245 262.881)",
      "--sidebar-primary": "oklch(0.546 0.245 262.881)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
    dark: {
      "--primary": "oklch(0.623 0.214 259.815)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.623 0.214 259.815)",
      "--sidebar-primary": "oklch(0.623 0.214 259.815)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
  },
  green: {
    label: "Green",
    swatch: "oklch(0.527 0.185 150.069)",
    light: {
      "--primary": "oklch(0.527 0.185 150.069)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.527 0.185 150.069)",
      "--sidebar-primary": "oklch(0.527 0.185 150.069)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
    dark: {
      "--primary": "oklch(0.627 0.194 149.214)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.627 0.194 149.214)",
      "--sidebar-primary": "oklch(0.627 0.194 149.214)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
  },
  red: {
    label: "Red",
    swatch: "oklch(0.577 0.245 27.325)",
    light: {
      "--primary": "oklch(0.577 0.245 27.325)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.577 0.245 27.325)",
      "--sidebar-primary": "oklch(0.577 0.245 27.325)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
    dark: {
      "--primary": "oklch(0.704 0.191 22.216)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.704 0.191 22.216)",
      "--sidebar-primary": "oklch(0.704 0.191 22.216)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
  },
  orange: {
    label: "Orange",
    swatch: "oklch(0.705 0.213 47.604)",
    light: {
      "--primary": "oklch(0.705 0.213 47.604)",
      "--primary-foreground": "oklch(0.13 0.02 50)",
      "--ring": "oklch(0.705 0.213 47.604)",
      "--sidebar-primary": "oklch(0.705 0.213 47.604)",
      "--sidebar-primary-foreground": "oklch(0.13 0.02 50)",
    },
    dark: {
      "--primary": "oklch(0.705 0.213 47.604)",
      "--primary-foreground": "oklch(0.13 0.02 50)",
      "--ring": "oklch(0.705 0.213 47.604)",
      "--sidebar-primary": "oklch(0.705 0.213 47.604)",
      "--sidebar-primary-foreground": "oklch(0.13 0.02 50)",
    },
  },
  violet: {
    label: "Violet",
    swatch: "oklch(0.541 0.281 293.009)",
    light: {
      "--primary": "oklch(0.541 0.281 293.009)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.541 0.281 293.009)",
      "--sidebar-primary": "oklch(0.541 0.281 293.009)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
    dark: {
      "--primary": "oklch(0.649 0.241 293.009)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.649 0.241 293.009)",
      "--sidebar-primary": "oklch(0.649 0.241 293.009)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
  },
  rose: {
    label: "Rose",
    swatch: "oklch(0.585 0.233 3.958)",
    light: {
      "--primary": "oklch(0.585 0.233 3.958)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.585 0.233 3.958)",
      "--sidebar-primary": "oklch(0.585 0.233 3.958)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
    dark: {
      "--primary": "oklch(0.685 0.203 3.958)",
      "--primary-foreground": "oklch(1 0 0)",
      "--ring": "oklch(0.685 0.203 3.958)",
      "--sidebar-primary": "oklch(0.685 0.203 3.958)",
      "--sidebar-primary-foreground": "oklch(1 0 0)",
    },
  },
};

/** Ordered list of preset keys for rendering in the UI. */
export const colorPresetKeys = Object.keys(colorPresets) as ColorPreset[];
