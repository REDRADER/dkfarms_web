import Link from "next/link";
import { priceLabel, site, type Room } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { Icon } from "@/components/icons";
import { Photo } from "@/components/ui/Photo";
import styles from "./RoomCard.module.css";

export function RoomCard({ room, showDetailsLink = false }: { room: Room; showDetailsLink?: boolean }) {
  const href = `/rooms/${room.slug}`;
  const cover = room.photos[0];
  return (
    <article className={`card card--lift reveal ${styles.card}`}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden="true">
        <Photo image={cover.image} alt="" sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 400px" />
      </Link>
      <div className={styles.body}>
        <h3 className="t-h3">
          <Link href={href} className={styles.title}>
            {room.name}
          </Link>
        </h3>
        <ul role="list" className={styles.specs}>
          <li>
            <Icon name="users" size={18} />
            {room.guests} guests
          </li>
          <li>
            <Icon name="bed" size={18} />
            {room.bed}
          </li>
          <li>
            <Icon name="mountain" size={18} />
            {room.view}
          </li>
        </ul>
        <div className={styles.foot}>
          <span className={styles.price}>
            from <strong>{priceLabel(room.priceFrom)}</strong>/night
          </span>
          <span className={styles.actions}>
            {showDetailsLink && (
              <Link href={href} className={styles.view}>
                View room
              </Link>
            )}
            <a
              className="btn btn--sm"
              href={waLink(site.whatsappNumber, waMessage.room(site.name, room.name))}
              target="_blank"
              rel="noopener"
              data-wa-source="room-card"
              aria-label={`Enquire about the ${room.name} on WhatsApp`}
            >
              Enquire
            </a>
          </span>
        </div>
      </div>
    </article>
  );
}
