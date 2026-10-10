"use client";

import { useSyncExternalStore } from "react";
import { Palette } from "lucide-react";
import { THEME_STORAGE_KEY, themes, type ThemeId } from "@/lib/theme";
import styles from "./ThemeSwitcher.module.css";

/**
 * Testing aid: lets the team and the client flip between the three palettes on
 * the live preview. Only rendered when NEXT_PUBLIC_THEME_SWITCHER=true.
 */
export function ThemeSwitcher({ initial }: { initial: ThemeId }) {
  // <html data-theme> is the single source of truth (set early by the boot script).
  const theme = useSyncExternalStore(subscribeTheme, () => document.documentElement.dataset.theme, () => initial);

  return (
    <details className={styles.switcher}>
      <summary aria-label="Colour palette (testing)">
        <Palette size={18} strokeWidth={1.5} aria-hidden="true" />
        <span>Palette</span>
      </summary>
      <div role="radiogroup" aria-label="Colour palette" className={styles.list}>
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={theme === t.id}
            className={styles.option}
            onClick={() => applyTheme(t.id)}
          >
            <span className={styles.swatch} aria-hidden="true">
              {t.swatch.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </details>
  );
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  localStorage.setItem(THEME_STORAGE_KEY, id);
}
