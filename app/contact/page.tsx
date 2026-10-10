import { ChevronDown, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { chat, enquiry, faqs, home, rooms, site } from "@/lib/content";
import { images } from "@/content/images.generated";
import { waLink, waMessage } from "@/lib/whatsapp";
import { breadcrumbJsonLd, faqJsonLd, pageMeta } from "@/lib/seo";
import { Icon, WhatsAppIcon } from "@/components/icons";
import { Photo } from "@/components/ui/Photo";
import { StylisedMap } from "@/components/ui/StylisedMap";
import { EnquiryWizard } from "@/components/enquiry/EnquiryWizard";
import { AskDiaButton } from "@/components/chat/AskDiaButton";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "./page.module.css";

export const metadata = pageMeta({
  title: "Contact & location",
  description: `Plan your stay at ${site.name}: WhatsApp, call or send an enquiry. ${site.nearLabel}, about 2 hours from Mumbai and 2.5 from Pune.`,
  path: "/contact",
});

export default function ContactPage() {
  const wa = waLink(site.whatsappNumber, waMessage.general(site.name));

  return (
    <>
      {/* Half-height hero */}
      <section className={styles.hero}>
        <Photo image="hero-valley" alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className={styles.heroImg} />
        <div className="container">
          <h1 className="t-h1">Plan your stay</h1>
          <p className="t-lead">We usually reply on WhatsApp within minutes.</p>
        </div>
      </section>

      {/* Ways to reach us */}
      <section className={`container ${styles.cards}`} aria-label="Ways to reach us">
        <article className={`card ${styles.contactCard}`}>
          <span className="icon-badge">
            <WhatsAppIcon size={22} />
          </span>
          <h2 className="t-h3">WhatsApp</h2>
          <p className="t-muted">Fastest way to reach us</p>
          <a className="btn btn--sm" href={wa} target="_blank" rel="noopener" data-wa-source="contact">
            Chat now
          </a>
        </article>
        <article className={`card ${styles.contactCard}`}>
          <span className="icon-badge icon-badge--sand">
            <Phone size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h2 className="t-h3">Call</h2>
          <p className="t-muted">Tap to call us directly</p>
          <a className={styles.contactLink} href={`tel:${site.phoneLink}`}>
            {site.phoneDisplay}
          </a>
        </article>
        <article className={`card ${styles.contactCard}`}>
          <span className="icon-badge">
            <Mail size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h2 className="t-h3">Email</h2>
          <p className="t-muted">For groups and offsites</p>
          <a className={styles.contactLink} href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </article>
      </section>

      {/* Enquiry wizard */}
      <section id="enquiry" className={`band-2 ${styles.enquiry}`}>
        <div className={`container ${styles.enquiryInner}`}>
          <div className={`card ${styles.enquiryCard}`}>
            <header className={styles.enquiryHead}>
              <h2 className="t-h2">{enquiry.title}</h2>
              <p className="t-muted">{enquiry.line}</p>
            </header>
            <EnquiryWizard
              content={enquiry}
              rooms={rooms.map((r) => ({
                id: r.slug,
                label: r.name,
                line: `Up to ${r.guests} guests · ${r.bed} bed · ${r.view} view`,
                image: images[r.photos[0].image],
              }))}
              packages={home.packages.map((p) => ({ id: p.id, label: p.name, icon: p.icon }))}
              whatsappNumber={site.whatsappNumber}
            />
          </div>
        </div>
      </section>

      {/* Find us */}
      <section className="container section">
        <div className="section-head reveal">
          <div>
            <h2 className="t-h2">Find us</h2>
            <p>Close to the city, far from the noise.</p>
          </div>
        </div>
        <div className={styles.findUs}>
          <div className={styles.mapCard}>
            <StylisedMap name={site.name} className={styles.map} />
            <div className={styles.address}>
              <MapPin size={20} strokeWidth={1.5} aria-hidden="true" />
              <address>
                <strong>{site.name}</strong>
                <span>
                  {site.address.line}, near {site.address.locality}, {site.address.region} {site.address.postalCode}
                </span>
              </address>
              <a className="btn btn--sm" href={site.mapsUrl} target="_blank" rel="noopener">
                <Navigation size={16} strokeWidth={1.5} aria-hidden="true" />
                Get directions
              </a>
            </div>
          </div>
          <div className={`card ${styles.drives}`}>
            <h3 className="t-h3">Drive times</h3>
            <ul role="list">
              {site.driveTimes.map((d, i) => (
                <li key={d.from}>
                  <span className={`icon-badge ${i % 2 ? "icon-badge--sand" : ""}`} style={{ "--badge": "36px" } as React.CSSProperties}>
                    <Icon name={d.icon} size={18} />
                  </span>
                  <span>{d.from}</span>
                  <strong>{d.time}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul role="list" className={styles.reach}>
          {site.howToReach.map((r, i) => (
            <li key={r.title} className={i % 2 ? "band-1" : "band-2"}>
              <span className="icon-badge icon-badge--white">
                <Icon name={r.icon} size={20} />
              </span>
              <span>
                <strong>{r.title}</strong>
                <span>{r.line}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ: same answers as the chat assistant (content/chat-faq.json) */}
      <section className="band-1" aria-labelledby="faq-title">
        <div className={`container section ${styles.faq}`}>
          <h2 id="faq-title" className="t-h2 reveal">
            Good to know
          </h2>
          <div className={styles.faqList}>
            {faqs.map((f, i) => (
              <details key={f.q} name="faq" open={i === 0} className={styles.faqItem}>
                <summary>
                  {f.q}
                  <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className={styles.faqMore}>
            Still curious?{" "}
            <AskDiaButton className={styles.askDia}>Ask {chat.bot.name}, our assistant</AskDiaButton>
          </p>
        </div>
      </section>

      <JsonLd data={faqJsonLd()} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
    </>
  );
}
