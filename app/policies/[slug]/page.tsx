import Link from "next/link";
import { notFound } from "next/navigation";
import { policies, site } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { WhatsAppIcon } from "@/components/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import styles from "./page.module.css";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const policy = policies.find((p) => p.slug === slug);
  if (!policy) notFound();
  return pageMeta({ title: policy.title, description: policy.intro, path: `/policies/${slug}` });
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const policy = policies.find((p) => p.slug === slug);
  if (!policy) notFound();

  return (
    <article className={`container section ${styles.page}`}>
      <nav aria-label="Other policies" className={styles.tabs}>
        {policies.map((p) => (
          <Link key={p.slug} href={`/policies/${p.slug}`} aria-current={p.slug === slug ? "page" : undefined}>
            {p.title.replace(" policy", "")}
          </Link>
        ))}
      </nav>
      <header className={styles.head}>
        <h1 className="t-h1">{policy.title}</h1>
        <p className="t-lead">{policy.intro}</p>
      </header>
      {policy.sections.map((s) => (
        <section key={s.heading} className={styles.section}>
          <h2 className="t-h3">{s.heading}</h2>
          <ul>
            {s.points.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </section>
      ))}
      <aside className={`band-1 ${styles.help}`}>
        <p>Questions about this? We&apos;re happy to help.</p>
        <a
          className="btn btn--sm"
          href={waLink(site.whatsappNumber, waMessage.chat(policy.title.toLowerCase()))}
          target="_blank"
          rel="noopener"
          data-wa-source="cta"
        >
          <WhatsAppIcon size={18} />
          Ask on WhatsApp
        </a>
      </aside>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: policy.title, path: `/policies/${slug}` },
        ])}
      />
    </article>
  );
}
