export const themes = [
  { id: "sage", label: "Sage & Sand", swatch: ["#DDE8DC", "#F1E4D3", "#5E7D63"] },
  { id: "blush", label: "Blush & Cream", swatch: ["#F6DDD8", "#FBEBD7", "#A85A4F"] },
  { id: "mist", label: "Mist & Lagoon", swatch: ["#DCEBF0", "#E6E1F2", "#3F6E80"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

const isTheme = (v: string | undefined): v is ThemeId => themes.some((t) => t.id === v);

/** The theme the site is deployed with. Set NEXT_PUBLIC_THEME to sage, blush or mist. */
export const defaultTheme: ThemeId = isTheme(process.env.NEXT_PUBLIC_THEME) ? process.env.NEXT_PUBLIC_THEME : "sage";

/**
 * The palette switcher is for testing with the client only.
 * Turn it on with NEXT_PUBLIC_THEME_SWITCHER=true; leave it off in production.
 */
export const themeSwitcherEnabled = process.env.NEXT_PUBLIC_THEME_SWITCHER === "true";

export const THEME_STORAGE_KEY = "dk-theme";

/** Applies the saved palette before first paint, so testers don't see a flash. */
export function themeBootScript(fallback: ThemeId) {
  const ids = JSON.stringify(themes.map((t) => t.id));
  return `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});document.documentElement.dataset.theme=${ids}.indexOf(t)>-1?t:${JSON.stringify(fallback)}}catch(e){}`;
}
