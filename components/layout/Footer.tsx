import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo name={site.name} inverted />
          <p>{site.tagline}</p>
        </div>

        <div className={styles.col}>
          <h2 className={styles.heading}>Contact</h2>
          <a href={`tel:${site.phoneLink}`}>
            <Phone size={18} strokeWidth={1.5} aria-hidden="true" />
            {site.phoneDisplay}
          </a>
          <a href={`mailto:${site.email}`}>
            <Mail size={18} strokeWidth={1.5} aria-hidden="true" />
            {site.email}
          </a>
          <a href={site.mapsUrl} target="_blank" rel="noopener">
            <MapPin size={18} strokeWidth={1.5} aria-hidden="true" />
            {site.address.line}, {site.address.locality}
          </a>
        </div>

        <div className={styles.col}>
          <h2 className={styles.heading}>Follow</h2>
          <a
            href={waLink(site.whatsappNumber, waMessage.general(site.name))}
            target="_blank"
            rel="noopener"
            data-wa-source="footer"
          >
            <WhatsAppIcon size={18} />
            WhatsApp
          </a>
          <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener">
            <InstagramIcon size={18} />
            Instagram
          </a>
        </div>

        <div className={styles.col}>
          <h2 className={styles.heading}>Policies</h2>
          <Link href="/policies/cancellation">Cancellation</Link>
          <Link href="/policies/house-rules">House rules</Link>
          <Link href="/policies/privacy">Privacy</Link>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {site.name}</span>
        <span>
          {site.address.locality}, {site.address.region}
        </span>
      </div>
    </footer>
  );
}
