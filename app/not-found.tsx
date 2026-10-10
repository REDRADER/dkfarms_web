import Link from "next/link";
import { Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container section" style={{ textAlign: "center", display: "grid", justifyItems: "center", gap: 18 }}>
      <span className="icon-badge" style={{ "--badge": "72px" } as React.CSSProperties}>
        <Sprout size={32} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h1 className="t-h1">Lost in the hills</h1>
      <p className="t-lead">This page wandered off. Let&apos;s get you back.</p>
      <Link href="/" className="btn">
        Back to home
      </Link>
    </section>
  );
}
