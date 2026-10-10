"use client";

import { useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./PhotoSlider.module.css";

export type SliderPhoto = { src: StaticImageData; alt: string };

/**
 * Small photo slider for the rooms list. Photos cross-fade; a photo is only
 * downloaded once it is shown or is the next one up. Arrow keys work while
 * focus is inside the slider, and a horizontal swipe moves one photo.
 */
export function PhotoSlider({
  photos,
  label,
  sizes,
  eager = false,
  className = "",
}: {
  photos: SliderPhoto[];
  /** Names the slider for screen readers, e.g. "Pool Villa photos" */
  label: string;
  sizes: string;
  /** Load the first photo straight away (use when it is the LCP image) */
  eager?: boolean;
  className?: string;
}) {
  const count = photos.length;
  const [index, setIndex] = useState(0);
  // Photos that have been shown (or preloaded) stay mounted, so going back never re-blurs.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));
  const touchX = useRef<number | null>(null);

  const show = (i: number) => {
    const next = (i + count) % count;
    setIndex(next);
    setMounted((m) => new Set(m).add(next).add((next + 1) % count));
  };
  const warmNext = () => {
    if (!mounted.has(1 % count)) setMounted((m) => new Set(m).add(1 % count));
  };

  return (
    <div
      className={`${styles.slider} ${className}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={warmNext}
      onFocus={warmNext}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") show(index + 1);
        if (e.key === "ArrowLeft") show(index - 1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {photos.map((p, i) =>
        mounted.has(i) ? (
          <Image
            key={p.src.src + i}
            src={p.src}
            alt={p.alt}
            aria-hidden={i !== index}
            fill
            sizes={sizes}
            placeholder="blur"
            className={`${styles.img} ${i === index ? styles.current : ""}`}
            {...(i === 0 && eager ? { loading: "eager", fetchPriority: "high" } : {})}
          />
        ) : null,
      )}

      {count > 1 && (
        <>
          <span className={styles.count} aria-live="polite">
            <span className="sr-only">Photo </span>
            {index + 1} / {count}
          </span>

          <div className={styles.dots}>
            {photos.map((p, i) => (
              <button
                key={i}
                type="button"
                className={styles.dot}
                onClick={() => show(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>

          <div className={styles.nav}>
            <button type="button" className={styles.round} onClick={() => show(index - 1)} aria-label="Previous photo">
              <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button type="button" className={styles.round} onClick={() => show(index + 1)} aria-label="Next photo">
              <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
