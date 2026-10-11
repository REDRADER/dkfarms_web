"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ScrollStrip.module.css";

/**
 * Horizontal scrolling list with previous/next buttons for mouse users, who
 * can't swipe and often have no horizontal wheel. Touch screens just swipe,
 * so the buttons are hidden there. Each button disappears at its end.
 */
export function ScrollStrip({
  label,
  className = "",
  children,
}: {
  /** Names the list for screen readers, e.g. "Photos" */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  // Both ends start "reached" so no button flashes before we've measured.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Most of a screenful; scroll-snap then settles on the nearest photo.
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={styles.wrap}>
      <ul ref={ref} role="list" aria-label={label} className={className}>
        {children}
      </ul>
      <button
        type="button"
        className={`${styles.round} ${styles.prev}`}
        onClick={() => move(-1)}
        disabled={atStart}
        aria-label="Scroll back"
      >
        <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${styles.round} ${styles.next}`}
        onClick={() => move(1)}
        disabled={atEnd}
        aria-label="Scroll forward"
      >
        <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>
  );
}
