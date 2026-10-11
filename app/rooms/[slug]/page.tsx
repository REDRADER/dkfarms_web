import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { images } from "@/content/images.generated";
import { getRoom, priceLabel, rooms, site } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { breadcrumbJsonLd, pageMeta, roomJsonLd } from "@/lib/seo";
import { Icon, WhatsAppIcon } from "@/components/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { RoomCard } from "@/components/cards/RoomCard";
import { RoomGallery } from "@/components/room/RoomGallery";
import { AmenityGrid } from "@/components/room/AmenityGrid";
import styles from "./page.module.css";

export function generateStaticParams() {
  return rooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/rooms/[slug]">) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();
  return pageMeta({
    title: room.name,
    description: room.detailLine,
    image: room.photos[0].image,
    path: `/rooms/${room.slug}`,
  });
}

export default async function RoomPage({ params }: PageProps<"/rooms/[slug]">) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();

  const message = waMessage.room(site.name, room.name);
  const others = rooms.filter((r) => r.slug !== room.slug);
  // "Pool Villa" → "In the villa"; falls back to "In the room".
  const kind = room.name.split(" ").at(-1)?.toLowerCase() ?? "room";

  return (
    <>
      {/* Photo hero */}
      <section className={`container ${styles.hero}`} aria-label={`${room.name} photos`}>
        <nav aria-label="Breadcrumb">
          <ol role="list" className={styles.crumbs}>
            <li>
              <Link href="/rooms">Rooms</Link>
            </li>
            <li aria-current="page">{room.name}</li>
          </ol>
        </nav>
        <RoomGallery
          roomName={room.name}
          photos={room.photos.map((p) => ({ src: images[p.image], alt: p.alt, caption: p.label, label: p.label }))}
        />
      </section>

      {/* Title */}
      <div className={`container reveal ${styles.titleBlock}`}>
        <div>
          <h1 className="t-h1">{room.name}</h1>
          <p className={styles.detailLine}>{room.detailLine}</p>
        </div>
        <p className={styles.price}>
          from <strong>{priceLabel(room.priceFrom)}</strong> /night
        </p>
      </div>

      <div className={`container ${styles.layout}`}>
        <div className={styles.content}>
          <ul role="list" className={`reveal ${styles.facts}`} aria-label="Room facts">
            {room.facts.map((f) => (
              <li key={f.label} className="pill">
                <Icon name={f.icon} size={18} />
                {f.label}
              </li>
            ))}
          </ul>

          <section className="reveal" aria-labelledby="amenities">
            <h2 id="amenities" className={`t-h2-sm ${styles.h2}`}>
              In the {kind}
            </h2>
            <AmenityGrid items={room.amenities} size="lg" />
          </section>

          <section className="reveal" aria-labelledby="included">
            <h2 id="included" className={`t-h2-sm ${styles.h2}`}>
              What&apos;s included
            </h2>
            <ul role="list" className={styles.included}>
              {room.included.map((c, i) => (
                <li key={c.label} className={`pill ${i % 2 ? "pill--sand" : "pill--sage"}`}>
                  <Icon name={c.icon} size={18} />
                  {c.label}
                </li>
              ))}
            </ul>
          </section>

          <section className="reveal" aria-labelledby="good-to-know">
            <h2 id="good-to-know" className={`t-h2-sm ${styles.h2}`}>
              Good to know
            </h2>
            <ul role="list" className={styles.rules}>
              {room.rules.map((r) => (
                <li key={r.label}>
                  <span className={styles.ruleIcon}>
                    <Icon name={r.icon} size={20} />
                  </span>
                  <span className={styles.rule}>
                    <span>{r.label}</span>
                    {r.value}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Enquiry card: sticks beside the content on desktop */}
        <div className={styles.side}>
          <aside className={`band-2 ${styles.enquiry}`} aria-labelledby="enquire">
            <h2 id="enquire" className="t-h2-sm">
              Enquire about this room
            </h2>
            <p className={styles.reply}>We usually reply within minutes.</p>
            <figure className={styles.preview}>
              <figcaption>Message preview</figcaption>
              <p className={styles.bubble}>
                {message.split("__").map((part, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span className={styles.blank}>
                        <span className="sr-only">blank</span>
                      </span>
                    )}
                    {part}
                  </span>
                ))}
              </p>
            </figure>
            <a
              className={`btn btn--block ${styles.chat}`}
              href={waLink(site.whatsappNumber, message)}
              target="_blank"
              rel="noopener"
              data-wa-source="room-detail"
            >
              <WhatsAppIcon size={20} />
              Chat on WhatsApp
            </a>
            <a className={styles.call} href={`tel:${site.phoneLink}`}>
              <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
              or call {site.phoneDisplay}
            </a>
          </aside>
          <p className={styles.formLink}>
            Prefer a form?{" "}
            <Link href={`/contact?room=${room.slug}#enquiry`}>Plan an enquiry</Link>
          </p>
        </div>
      </div>

      {/* Other rooms */}
      {others.length > 0 && (
        <section className="band-1" aria-labelledby="other-rooms">
          <div className="container section">
            <div className="section-head reveal">
              <div>
                <h2 id="other-rooms" className="t-h2">
                  Other rooms you may like
                </h2>
              </div>
              <Link href="/rooms" className="link-arrow">
                All rooms <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.others}>
              {others.map((r) => (
                <RoomCard key={r.slug} room={r} showDetailsLink />
              ))}
            </div>
          </div>
        </section>
      )}

      <JsonLd data={roomJsonLd(room)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Rooms", path: "/rooms" },
          { name: room.name, path: `/rooms/${room.slug}` },
        ])}
      />
    </>
  );
}
