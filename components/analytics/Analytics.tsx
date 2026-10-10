"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Loads GA4 when NEXT_PUBLIC_GA_ID is set, and reports every WhatsApp click as a
 * `whatsapp_click` event. Links opt in with `data-wa-source="<where>"`, so the
 * links themselves can stay server-rendered.
 */
export function Analytics({ gaId }: { gaId?: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest<HTMLElement>("[data-wa-source]");
      if (!link) return;
      window.gtag?.("event", "whatsapp_click", {
        source: link.dataset.waSource,
        page_path: location.pathname,
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!gaId) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  );
}

/** For events from client code (e.g. the enquiry form). */
export function track(event: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", event, params);
}
