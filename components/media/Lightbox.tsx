"use client";

import { useCallback, useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./Lightbox.module.css";

export type LightboxPhoto = { src: StaticImageData; alt: string; caption?: string };

/**
 * Full-screen photo viewer built on the native <dialog> (focus trap, Esc and
 * inert background for free). Arrow keys and swipe move between photos; only
 * the current photo and its neighbour are downloaded.
 */
export function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: LightboxPhoto[];
  index: number | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const count = photos.length;

  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      onIndexChange((index + step + count) % count);
    },
    [index, count, onIndexChange],
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const photo = index !== null ? photos[index] : null;
  const next = index !== null && count > 1 ? photos[(index + 1) % count] : null;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label="Photo viewer"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {photo && (
        <>
          <div className={styles.top}>
            <span className={styles.count} aria-live="polite">
              {index! + 1} / {count}
            </span>
            <button type="button" className={styles.icon} onClick={onClose} aria-label="Close photo viewer" autoFocus>
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <figure className={styles.figure}>
            <div className={styles.frame}>
              <Image
                key={photo.src.src}
                src={photo.src}
                alt={photo.alt}
                placeholder="blur"
                sizes="(max-width: 1000px) 100vw, 80vw"
                quality={80}
                className={styles.img}
              />
            </div>
            {(photo.caption || photo.alt) && <figcaption>{photo.caption ?? photo.alt}</figcaption>}
          </figure>

          {count > 1 && (
            <>
              <button type="button" className={`${styles.icon} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous photo">
                <ChevronLeft size={24} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button type="button" className={`${styles.icon} ${styles.next}`} onClick={() => go(1)} aria-label="Next photo">
                <ChevronRight size={24} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </>
          )}

          {/* Warm the cache for the next photo only */}
          {next && (
            <Image src={next.src} alt="" aria-hidden="true" sizes="(max-width: 1000px) 100vw, 80vw" quality={80} className={styles.preload} />
          )}
        </>
      )}
    </dialog>
  );
}
