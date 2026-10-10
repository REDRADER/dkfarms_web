# DK Farms website

Next.js 16 (App Router) site for DK Farms, built from the pastel / line-icon design brief and the
HTML design boards in the parent folder.

- **Content:** all guest-facing text is in [`content/`](content/README.md) (JSON), validated when the site builds.
- **Design system:** colour themes in `styles/themes.css`, tokens in `styles/tokens.css`,
  shared UI primitives in `styles/ui.css`, components in `components/`.
- **Enquiries:** WhatsApp click-to-chat everywhere, plus a step-by-step enquiry form (`/contact#enquiry`)
  that sends either on WhatsApp (prefilled) or by email (server-side, via Gmail).
- **Chat assistant "Dia":** click-through FAQ (no typing), from `content/chat-faq.json`.

## Run it

```bash
pnpm install
cp .env.example .env.local      # then fill in values
pnpm dev                        # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Local development server |
| `pnpm build && pnpm start` | Production build and server |
| `pnpm images` | Optimise photos from `photos/` into `assets/photos/` and refresh the image registry |
| `pnpm placeholders` | Create placeholder photos for any that are missing |
| `pnpm typecheck` / `pnpm lint` | Type and lint checks |

## Colour systems

Three palettes from the brief: `sage` (Sage & Sand, the one in the designs), `blush` (Blush & Cream)
and `mist` (Mist & Lagoon).

- **Testing:** set `NEXT_PUBLIC_THEME_SWITCHER=true` to show a floating **Palette** button that switches
  the whole site live. The choice is remembered in that browser.
- **Deploying:** set `NEXT_PUBLIC_THEME` to the chosen palette and leave the switcher `false`.
  Only that palette is applied; the switcher code isn't rendered.

Components use semantic tokens only (`--color-accent`, `--color-pastel-1`, …), never raw colours,
so a palette is a single block in `styles/themes.css`.

## Enquiry email (Gmail)

The enquiry form's **Send by email** runs a Next.js Server Action (`app/contact/actions.ts`) on the server.
The Gmail address and password are server-only environment variables, so they never reach the browser.

1. Use (or create) a Gmail account for the website and turn on **2-Step Verification**.
2. Go to Google Account → Security → **App passwords**, and create one for "Mail".
   Gmail rejects the normal account password for SMTP; the 16-character App Password is required.
3. Set these environment variables (in `.env.local` locally, and in the host's settings for production):
   - `GMAIL_USER` = the Gmail address
   - `GMAIL_APP_PASSWORD` = the App Password
   - `ENQUIRY_TO` (optional) = where enquiries go. Defaults to `GMAIL_USER`, i.e. it mails itself.

The email arrives with a subject like "New enquiry: Pool Villa · Sat, 14 Nov, 2026 · Asha Patil".
Its Reply-To is set to the guest's email when they gave one.

**Spam protection:**
- A hidden honeypot field.
- A minimum time on the form.
- Validation on both browser and server.
- A small per-IP rate limit (5 per 10 minutes; in-memory, so per server instance).

If email isn't configured, guests see a friendly message pointing them to WhatsApp.

## Images

- Originals go in `photos/` (git-ignored). `pnpm images` writes web-ready copies to `assets/photos/`:
  - long edge capped at 2400 px
  - EXIF/GPS removed
  - sRGB
- Every photo goes through `components/ui/Photo.tsx` (`next/image`), which:
  - serves AVIF, falling back to WebP
  - picks a width per screen (`deviceSizes` in `next.config.ts`)
  - lazy-loads below the fold
  - shows a blur placeholder while loading
- The hero image loads with `fetchPriority="high"` for a fast Largest Contentful Paint (LCP).
- The placeholder photos are soft illustrations; real photos with the same file names replace them.

## SEO

- **Per-page metadata:** title template, description, canonical URL and Open Graph/Twitter cards (`lib/seo.ts`).
- **JSON-LD structured data:**
  - `Resort` on every page
  - `HotelRoom` (+ `Offer` once prices are numbers) per room
  - `FAQPage` on Contact
  - `BreadcrumbList`
  - The rating (`AggregateRating`) is only emitted when `site.json` → `rating.count` is greater than 0.
- `sitemap.xml` and `robots.txt` are generated from content.
- Semantic HTML: one `h1` per page, alt text from content, `lang="en-IN"`.

## Analytics

Set `NEXT_PUBLIC_GA_ID` to load GA4. Every WhatsApp click sends `whatsapp_click` with a `source`
(header, hero, room-card, package, chat, enquiry, bottom-bar, …). Enquiry sends send `enquiry_submit`
with `method` = `whatsapp` or `email`.

## Deploying (Vercel recommended)

1. Push this folder to a Git repo and import it in Vercel. The defaults work, and image optimisation is built in.
2. Add the environment variables from `.env.example`. Use `NEXT_PUBLIC_THEME_SWITCHER=false` for production.
3. Set `content/site.json` → `url` to the real domain (used for canonical URLs, the sitemap and structured data).
4. After launch, submit `https://<domain>/sitemap.xml` in Google Search Console.

## Before launch: replace placeholders

These are still placeholders in `content/`:
- the WhatsApp number (`91XXXXXXXXXX`), phone, address, PIN and map link
- prices (`priceFrom`), Google review count and guest names
- the policy wording
- photos
