import { Suspense } from "react";
import { site } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import { Logo } from "./Logo";
import { NavLinks, NavLinksStatic } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import styles from "./Header.module.css";

export function Header() {
  const wa = waLink(site.whatsappNumber, waMessage.general(site.name));
  const waButton = (source: string) => (
    <a className="btn" href={wa} target="_blank" rel="noopener" data-wa-source={source}>
      <WhatsAppIcon size={18} />
      Chat on WhatsApp
    </a>
  );

  return (
    <header className={styles.header}>
      <div className={`container container-wide ${styles.inner}`}>
        <Logo name={site.name} />
        <nav aria-label="Main" className="hide-tablet">
          <Suspense fallback={<NavLinksStatic className={styles.links} />}>
            <NavLinks className={styles.links} />
          </Suspense>
        </nav>
        <div className={`hide-tablet ${styles.cta}`}>{waButton("header")}</div>
        <div className={styles.mobileOnly}>
          <Suspense>
            <MobileMenu>{waButton("header")}</MobileMenu>
          </Suspense>
        </div>
      </div>
    </header>
  );
}
