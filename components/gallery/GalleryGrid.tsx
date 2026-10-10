"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import Image, { type StaticImageData } from "next/image";
import { LayoutGrid } from "lucide-react";
import { Icon, type IconName } from "@/components/icons";
import { Lightbox } from "@/components/media/Lightbox";
import styles from "./GalleryGrid.module.css";

export type GalleryTile = {
  src: StaticImageData;
  alt: string;
  caption: string;
  categories: string[];
  cols: 1 | 2;
  rows: 2 | 3;
};

const ALL = "All";

/* Filter icons for the categories in content/gallery.json; a new category simply shows without one. */
const categoryIcons: Record<string, IconName> = {
  Rooms: "bed",
  Pool: "pool",
  Food: "food",
  Experiences: "mountain",
  Events: "heart",
  Monsoon: "trees",
};

function FilterIcon({ category }: { category: string }) {
  if (category === ALL) return <LayoutGrid size={18} strokeWidth={1.5} aria-hidden="true" />;
  const name = categoryIcons[category];
  return name ? <Icon name={name} size={18} /> : null;
}

/**
 * Filterable bento grid. Tiles glide to their new places when the filter
 * changes (View Transitions where supported, instant otherwise or when the
 * visitor prefers less motion); tapping one opens the lightbox over the
 * photos currently shown.
 */
export function GalleryGrid({ categories, photos }: { categories: string[]; photos: GalleryTile[] }) {
  const [filter, setFilter] = useState(ALL);
  const [open, setOpen] = useState<number | null>(null);

  const shown = filter === ALL ? photos : photos.filter((p) => p.categories.includes(filter));

  function pick(next: string) {
    if (next === filter) return;
    const animate =
      typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (animate) document.startViewTransition(() => flushSync(() => setFilter(next)));
    else setFilter(next);
  }

  return (
    <>
      <div role="group" aria-label="Filter photos" className={`container hscroll ${styles.filters}`}>
        {[ALL, ...categories].map((c) => (
          <button
            key={c}
            type="button"
            className={`chip chip--sand ${styles.chip}`}
            aria-pressed={c === filter}
            onClick={() => pick(c)}
          >
            <FilterIcon category={c} />
            {c}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {filter === ALL ? `Showing all ${shown.length} photos` : `Showing ${shown.length} ${filter} photos`}
      </p>

      <ul role="list" className={`container container-wide ${styles.grid}`}>
        {shown.map((p, i) => (
          <li
            key={p.src.src}
            className={styles.cell}
            style={
              {
                gridColumn: `span ${p.cols}`,
                gridRow: `span ${p.rows}`,
                viewTransitionName: `gallery-${photos.indexOf(p)}`,
              } as React.CSSProperties
            }
          >
            <button type="button" className={styles.tile} aria-label={`Open photo: ${p.caption}`} onClick={() => setOpen(i)}>
              <Image
                src={p.src}
                alt={p.alt}
                fill
                placeholder="blur"
                sizes={p.cols === 2 ? "(max-width: 1000px) 100vw, 640px" : "(max-width: 1000px) 50vw, 320px"}
                {...(i === 0 && { loading: "eager", fetchPriority: "high" })}
              />
              <span className={styles.caption}>{p.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        photos={shown.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
        index={open}
        onIndexChange={setOpen}
        onClose={() => setOpen(null)}
      />
    </>
  );
}
