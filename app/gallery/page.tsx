import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gallery, site } from "@/lib/content";
import { images } from "@/content/images.generated";
import { waLink, waMessage } from "@/lib/whatsapp";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { Photo } from "@/components/ui/Photo";
import { JsonLd } from "@/components/seo/JsonLd";
import { GalleryGrid, type GalleryTile } from "@/components/gallery/GalleryGrid";
import styles from "./page.module.css";

export const metadata = pageMeta({
  title: "Gallery",
  description: "Rooms, pool, food and monsoon views at DK Farms. Mist, sunshine and slow afternoons.",
  path: "/gallery",
  image: "pool",
});

/* Photos shown in the Instagram strip */
const instaPicks = ["sunrise", "breakfast", "pool", "monsoon", "bonfire", "garden-cottage"];

export default function GalleryPage() {
  // Resolve photos here so the client grid gets image data, not the whole photo registry.
  const tiles: GalleryTile[] = gallery.photos.map((p) => ({
    src: images[p.image],
    alt: p.alt,
    caption: p.caption,
    categories: p.categories,
    cols: p.cols,
    rows: p.rows,
  }));
  const instagramUrl = `https://instagram.com/${site.instagram}`;
  const insta = instaPicks.map((key) => gallery.photos.find((p) => p.image === key) ?? { image: key, alt: "" });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ])}
      />

      {/* 1. Intro */}
      <section className={`container ${styles.intro}`}>
        <p className="t-eyebrow">Gallery</p>
        <h1 className="t-h1">Moments at DK Farms</h1>
        <p className="t-lead">Mist, sunshine and slow afternoons.</p>
      </section>

      {/* 2. Filters + photo grid */}
      <section aria-label="Photos">
        <GalleryGrid categories={gallery.categories} photos={tiles} />
      </section>

      {/* 3. Instagram */}
      <section className={`container container-wide section ${styles.insta}`}>
        <div className={`reveal ${styles.instaHead}`}>
          <h2 className={styles.instaTitle}>
            Follow us <span>@{site.instagram}</span>
          </h2>
          <a href={instagramUrl} target="_blank" rel="noopener" className="btn btn--ghost">
            <InstagramIcon size={20} />
            Open Instagram
          </a>
        </div>
        <ul role="list" className={`reveal ${styles.instaGrid}`}>
          {insta.map((p) => (
            <li key={p.image}>
              <a href={instagramUrl} target="_blank" rel="noopener" aria-label={`${p.alt || "Photo"}, on Instagram`}>
                <Photo image={p.image} alt="" fill sizes="(max-width: 1000px) 33vw, 200px" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Call to action */}
      <section className="band-1">
        <div className={`container section reveal ${styles.cta}`}>
          <h2 className="t-h2">Like what you see?</h2>
          <p className="t-lead">Send us your dates and we&apos;ll keep the view ready.</p>
          <div className={styles.ctaActions}>
            <a
              className="btn btn--lg"
              href={waLink(site.whatsappNumber, waMessage.general(site.name))}
              target="_blank"
              rel="noopener"
              data-wa-source="cta"
            >
              <WhatsAppIcon size={20} />
              Chat on WhatsApp
            </a>
            <Link href="/contact#enquiry" className="link-arrow">
              Plan an enquiry <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
