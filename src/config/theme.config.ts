/** Available color presets — each maps to a set of CSS variable overrides. */
export type ColorPreset =
  | "slate"
  | "blue"
  | "green"
  | "red"
  | "orange"
  | "violet"
  | "rose";

/** Available font families. */
export type FontFamily = "geist" | "system";

export interface ThemeConfig {
  /** Brand name shown in the topbar and page metadata. */
  brandName: string;
  /** Logo URL (relative to /public). Null = text-only brand. */
  logoUrl: string | null;
  /** Default color preset applied on first visit. */
  colorPreset: ColorPreset;
  /** Default font family applied on first visit. */
  fontFamily: FontFamily;
  /** Layout defaults. */
  layout: {
    /** Default color scheme (light/dark/system) — sets next-themes default. */
    defaultTheme: "light" | "dark" | "system";
    /** Whether the sidebar is shown in the dashboard. */
    showSidebar: boolean;
  };
}

/**
 * Default theme configuration.
 * Developers clone this repo and customise these values for their domain.
 * End-users can further override via the Settings page (saved to localStorage).
 */
export const themeConfig: ThemeConfig = {
  brandName: "RAG Forge",
  logoUrl: null,
  colorPreset: "slate",
  fontFamily: "geist",
  layout: {
    defaultTheme: "dark",
    showSidebar: true,
  },
};
