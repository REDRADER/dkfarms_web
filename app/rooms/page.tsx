import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { images } from "@/content/images.generated";
import { priceLabel, rooms, site, type Room } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { Icon, WhatsAppIcon, type IconName } from "@/components/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { PhotoSlider } from "@/components/room/PhotoSlider";
import { AmenityGrid } from "@/components/room/AmenityGrid";
import styles from "./page.module.css";

export const metadata = pageMeta({
  title: "Rooms",
  description: "Three quiet stays at DK Farms, all with breakfast: a private pool villa, a garden cottage and a hill-view room.",
  path: "/rooms",
});

/** The four short specs shown on the list ("4 guests", "King bed", …); the detail page shows the full facts. */
function shortFacts(room: Room): { icon: IconName; label: string }[] {
  const view = room.facts.find((f) => /view/i.test(f.label)) ?? { icon: "mountain", label: `${room.view} view` };
  return [
    { icon: "users", label: `${room.guests} guests` },
    { icon: "bed", label: `${room.bed} bed` },
    { icon: "size", label: room.size },
    view,
  ];
}

export default function RoomsPage() {
  return (
    <>
      <header className={`container ${styles.head}`}>
        <p className="t-eyebrow">Rooms</p>
        <h1 className="t-h1">Rooms with a view</h1>
        <p className="t-muted">Three quiet stays. All with breakfast.</p>
      </header>

      {/* One row per room; the photo swaps sides on every other row */}
      {rooms.map((room, i) => {
        const href = `/rooms/${room.slug}`;
        return (
          <section
            key={room.slug}
            id={room.slug}
            aria-labelledby={`${room.slug}-title`}
            className={`container reveal ${styles.room} ${i % 2 ? styles.flip : ""}`}
          >
            <PhotoSlider
              photos={room.photos.slice(0, 3).map((p) => ({ src: images[p.image], alt: p.alt }))}
              label={`${room.name} photos`}
              sizes="(max-width: 1000px) 100vw, 660px"
              eager={i === 0}
              className={styles.slider}
            />

            <div className={styles.body}>
              <div className={styles.title}>
                <h2 id={`${room.slug}-title`} className="t-h2">
                  <Link href={href}>{room.name}</Link>
                </h2>
                <p className="t-muted">{room.line}</p>
              </div>

              <ul role="list" className={styles.facts} aria-label="Room facts">
                {shortFacts(room).map((f) => (
                  <li key={f.label} className="pill pill--sand">
                    <Icon name={f.icon} size={16} />
                    {f.label}
                  </li>
                ))}
              </ul>

              <AmenityGrid items={room.amenities.slice(0, 8)} />

              <div className={styles.foot}>
                <p className={styles.price}>
                  from <strong>{priceLabel(room.priceFrom)}</strong> /night
                </p>
                <span className={styles.actions}>
                  <a
                    className={`btn ${styles.enquire}`}
                    href={waLink(site.whatsappNumber, waMessage.room(site.name, room.name))}
                    target="_blank"
                    rel="noopener"
                    data-wa-source="room-card"
                    aria-label={`Enquire about the ${room.name} on WhatsApp`}
                  >
                    <WhatsAppIcon size={18} />
                    Enquire on WhatsApp
                  </a>
                  <Link href={href} className="link-arrow">
                    View room <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </span>
              </div>
            </div>
          </section>
        );
      })}

      {/* Help choosing */}
      <section className={`container ${styles.help}`}>
        <div className={`band-1 reveal ${styles.helpCard}`}>
          <h2 className="t-h2">Not sure which one?</h2>
          <p>Tell us who&apos;s coming. We&apos;ll suggest the right stay.</p>
          <div className={styles.helpActions}>
            <a
              className={`btn ${styles.enquire}`}
              href={waLink(site.whatsappNumber, waMessage.general(site.name))}
              target="_blank"
              rel="noopener"
              data-wa-source="cta"
            >
              <WhatsAppIcon size={18} />
              Chat on WhatsApp
            </a>
            <Link href="/contact#enquiry" className="link-arrow">
              Plan an enquiry <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Rooms", path: "/rooms" },
        ])}
      />
    </>
  );
}
