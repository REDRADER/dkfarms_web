import { Phone } from "lucide-react";
import { chat, site } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import styles from "./FloatingActions.module.css";

/**
 * Present on every page (brief): chatbot bubble bottom-left, WhatsApp button
 * bottom-right on desktop, and a sticky Call + WhatsApp bar on mobile.
 */
export function FloatingActions() {
  const wa = waLink(site.whatsappNumber, waMessage.general(site.name));

  return (
    <>
      <ChatLauncher
        chat={chat}
        links={{
          whatsappNumber: site.whatsappNumber,
          phone: site.phoneLink,
          maps: site.mapsUrl,
        }}
      />

      <a
        href={wa}
        target="_blank"
        rel="noopener"
        className={styles.wa}
        aria-label="Chat with us on WhatsApp"
        data-wa-source="floating"
      >
        <span className={styles.waLabel}>Chat with us</span>
        <span className={styles.waBtn}>
          <WhatsAppIcon size={28} />
        </span>
      </a>

      <nav className={styles.bar} aria-label="Quick contact">
        <a href={`tel:${site.phoneLink}`} className="btn btn--sand">
          <Phone size={18} strokeWidth={1.5} aria-hidden="true" />
          Call
        </a>
        <a href={wa} target="_blank" rel="noopener" className="btn" data-wa-source="bottom-bar">
          <WhatsAppIcon size={18} />
          WhatsApp
        </a>
      </nav>
    </>
  );
}
