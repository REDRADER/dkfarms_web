import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { home, rooms, site } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { pageMeta } from "@/lib/seo";
import { Icon, InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { Photo } from "@/components/ui/Photo";
import { ScrollStrip } from "@/components/ui/ScrollStrip";
import { RoomCard } from "@/components/cards/RoomCard";
import { LocationCard } from "@/components/home/LocationCard";
import styles from "./page.module.css";

export const metadata = pageMeta({ path: "/" });

export default function HomePage() {
  const { hero } = home;

  return (
    <>
      {/* 1. Hero: one photo, one headline, one action */}
      <section className={styles.hero}>
        <Photo image={hero.image} alt={hero.alt} fill loading="eager" fetchPriority="high" sizes="100vw" className={styles.heroImg} />
        <div className={`container ${styles.heroInner}`}>
          <p className="t-eyebrow">{site.areaLabel}</p>
          <h1 className="t-display">{hero.title}</h1>
          <p className={`t-lead ${styles.heroLine}`}>{hero.line}</p>
          <a
            className="btn btn--lg"
            href={waLink(site.whatsappNumber, waMessage.general(site.name))}
            target="_blank"
            rel="noopener"
            data-wa-source="hero"
          >
            <WhatsAppIcon size={20} />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* 2. Highlights */}
      <section className={`container ${styles.highlights}`} aria-label="Highlights">
        <ul role="list" className={`hscroll reveal ${styles.highlightList}`}>
          {site.highlights.map((h, i) => (
            <li key={h.label}>
              <span className={`icon-badge ${i % 2 ? "icon-badge--sand" : ""}`}>
                <Icon name={h.icon} size={32} />
              </span>
              {h.label}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Rooms */}
      <section id="rooms" className="container section">
        <div className="section-head reveal">
          <div>
            <h2 className="t-h2">Stay a while</h2>
            <p>Three ways to wake up to the valley.</p>
          </div>
          <Link href="/rooms" className="link-arrow">
            View all rooms <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.grid3}>
          {rooms.map((r) => (
            <RoomCard key={r.slug} room={r} />
          ))}
        </div>
      </section>

      {/* 4. Experiences */}
      <section id="experiences" className="band-2">
        <div className="container section">
          <div className="section-head section-head--center reveal">
            <div>
              <h2 className="t-h2">Days, unhurried</h2>
              <p>Swim, rest, wander, repeat.</p>
            </div>
          </div>
          <ul role="list" className={styles.bento}>
            {home.experiences.map((e) => (
              <li key={e.label} className={`reveal ${e.size === "large" ? styles.large : ""}`}>
                <Photo
                  image={e.image}
                  alt={e.alt}
                  fill
                  sizes={e.size === "large" ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, 25vw"}
                />
                <span className={styles.tag}>
                  <Icon name={e.icon} size={18} />
                  {e.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Packages */}
      <section id="packages" className="container section">
        <div className="section-head reveal">
          <div>
            <h2 className="t-h2">Made for your plan</h2>
            <p>Pick a package, we&apos;ll handle the rest.</p>
          </div>
        </div>
        <div className={styles.grid4}>
          {home.packages.map((p, i) => (
            <article key={p.id} className={`reveal ${styles.package} ${i % 2 ? "band-1" : "band-2"}`}>
              <span className="icon-badge icon-badge--white" style={{ "--badge": "52px" } as React.CSSProperties}>
                <Icon name={p.icon} size={24} />
              </span>
              <h3 className="t-h3">{p.name}</h3>
              <ul role="list" className={styles.includes} aria-label="Included">
                {p.includes.map((inc) => (
                  <li key={inc.label}>
                    <Icon name={inc.icon} size={22} />
                    {inc.label}
                  </li>
                ))}
              </ul>
              <a
                href={waLink(site.whatsappNumber, waMessage.package(p.name))}
                target="_blank"
                rel="noopener"
                className="link-arrow"
                data-wa-source="package"
                aria-label={`Know more about the ${p.name} package on WhatsApp`}
              >
                Know more <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Reviews */}
      <section className="band-1">
        <div className="container section">
          <div className={`reveal ${styles.rating}`}>
            <p className={styles.score}>
              <span>{site.rating.value.toFixed(1)}</span>
              <span className={styles.stars} role="img" aria-label={`${site.rating.value} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={22} strokeWidth={1.5} aria-hidden="true" />
                ))}
              </span>
            </p>
            <p className="t-muted">
              Loved by guests on Google
              {site.rating.count > 0 ? ` · ${site.rating.count} reviews` : ""}
            </p>
          </div>
          <div className={styles.grid3}>
            {home.reviews.map((r) => (
              <figure key={r.quote} className={`reveal ${styles.review}`}>
                <blockquote>“{r.quote}”</blockquote>
                <figcaption>
                  {r.name} · {r.city}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Gallery strip */}
      <section id="gallery" className="section">
        <div className="container section-head reveal">
          <div>
            <h2 className="t-h2">Moments here</h2>
            <p>Mist, monsoon and long lunches.</p>
          </div>
          <span className={styles.galleryLinks}>
            <Link href="/gallery" className="link-arrow">
              Full gallery <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener" className="link-arrow">
              <InstagramIcon size={20} />@{site.instagram}
            </a>
          </span>
        </div>
        <ScrollStrip label="Photos" className={`hscroll ${styles.strip}`}>
          {home.galleryStrip.map((g, i) => (
            <li key={i} className={g.wide ? styles.wide : undefined}>
              <Photo image={g.image} alt={g.alt} fill sizes={g.wide ? "460px" : "300px"} />
            </li>
          ))}
        </ScrollStrip>
      </section>

      {/* 8. Location */}
      <section id="location" className={`container ${styles.location}`}>
        <LocationCard />
      </section>
    </>
  );
}
