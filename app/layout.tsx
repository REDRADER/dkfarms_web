import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { site } from "@/lib/content";
import { defaultTheme, themeBootScript, themeSwitcherEnabled } from "@/lib/theme";
import { resortJsonLd } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { Analytics } from "@/components/analytics/Analytics";
import { ThemeSwitcherLoader } from "@/components/theme/ThemeSwitcherLoader";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";
import "@/styles/ui.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Farm stay near Karjat, 2 hrs from Mumbai`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      data-theme={defaultTheme}
      className={`${serif.variable} ${sans.variable}`}
      suppressHydrationWarning={themeSwitcherEnabled}
    >
      <head>
        {themeSwitcherEnabled && <script dangerouslySetInnerHTML={{ __html: themeBootScript(defaultTheme) }} />}
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <FloatingActions />
        <ThemeSwitcherLoader />
        <Analytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <JsonLd data={resortJsonLd()} />
      </body>
    </html>
  );
}
