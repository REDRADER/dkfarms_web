"use client";

import dynamic from "next/dynamic";
import { defaultTheme, themeSwitcherEnabled } from "@/lib/theme";

// `ssr: false` needs a Client Component boundary (not allowed directly in a Server
// Component), which is also what actually keeps this chunk out of every visitor's
// bundle: without it, Next registers the chunk as an eager SSR dependency regardless
// of the condition below.
const ThemeSwitcher = dynamic(() => import("./ThemeSwitcher").then((m) => m.ThemeSwitcher), { ssr: false });

export function ThemeSwitcherLoader() {
  if (!themeSwitcherEnabled) return null;
  return <ThemeSwitcher initial={defaultTheme} />;
}
