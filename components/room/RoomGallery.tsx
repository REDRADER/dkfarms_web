"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { Lightbox, type LightboxPhoto } from "@/components/media/Lightbox";
import styles from "./RoomGallery.module.css";

/**
 * Room photo hero: one large photo and the next four as labelled thumbnails.
 * A thumbnail or "View all photos" opens the lightbox at that photo.
 */
export function RoomGallery({ photos, roomName }: { photos: (LightboxPhoto & { label: string })[]; roomName: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [main, ...rest] = photos;
  const thumbs = rest.slice(0, 4);

  return (
    <>
      <div className={styles.main}>
        <Image
          src={main.src}
          alt={main.alt}
          fill
          placeholder="blur"
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 1280px) 100vw, 1200px"
          className={styles.img}
        />
        <button type="button" className={styles.all} onClick={() => setOpen(0)}>
          <LayoutGrid size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className="hide-mobile">View all photos</span>
          <span className="only-mobile">All photos</span>
          <span className="sr-only"> of the {roomName} ({photos.length})</span>
        </button>
      </div>

      {thumbs.length > 0 && (
        <ul role="list" className={styles.thumbs}>
          {thumbs.map((p, i) => (
            <li key={p.src.src + i}>
              <button
                type="button"
                className={styles.thumb}
                onClick={() => setOpen(i + 1)}
                aria-label={`View ${p.label.toLowerCase()} photo`}
              >
                <Image src={p.src} alt="" fill placeholder="blur" sizes="(max-width: 640px) 25vw, 300px" className={styles.img} />
                <span className={styles.label} aria-hidden="true">
                  {p.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox photos={photos} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
