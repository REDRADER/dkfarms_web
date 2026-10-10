import "server-only";
import { z } from "zod";
import { iconNames } from "@/components/icons";
import { images } from "@/content/images.generated";
import siteJson from "@/content/site.json";
import roomsJson from "@/content/rooms.json";
import homeJson from "@/content/home.json";
import galleryJson from "@/content/gallery.json";
import chatJson from "@/content/chat-faq.json";
import enquiryJson from "@/content/enquiry.json";
import policiesJson from "@/content/policies.json";

/*
 * Every content file is validated here when the site builds. If the owner makes
 * a typo (unknown icon, missing photo, broken chat link), the build stops with
 * a message naming the file and the field, instead of shipping a broken page.
 */

const icon = z.enum(iconNames);
const image = z.string().refine((key) => key in images, {
  error: (issue) => `No photo named "${issue.input}". Add photos/${issue.input}.jpg and run \`pnpm images\`.`,
});
const iconLabel = z.object({ icon, label: z.string().min(1) });

const siteSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  url: z.url(),
  whatsappNumber: z.string(),
  phoneDisplay: z.string(),
  phoneLink: z.string(),
  email: z.string(),
  instagram: z.string(),
  address: z.object({
    line: z.string(),
    locality: z.string(),
    region: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  geo: z.object({ lat: z.number(), lng: z.number() }),
  mapsUrl: z.url(),
  areaLabel: z.string(),
  nearLabel: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  priceFromLabel: z.string(),
  rating: z.object({ value: z.number().min(0).max(5), count: z.number().int().min(0), url: z.string() }),
  driveTimes: z.array(z.object({ from: z.string(), time: z.string(), icon })),
  howToReach: z.array(z.object({ title: z.string(), line: z.string(), icon })),
  highlights: z.array(iconLabel),
});

const roomSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  name: z.string(),
  line: z.string(),
  detailLine: z.string(),
  priceFrom: z.number().positive().nullable(),
  guests: z.number().int().positive(),
  bed: z.string(),
  size: z.string(),
  view: z.string(),
  photos: z.array(z.object({ image, alt: z.string().min(1), label: z.string() })).min(1),
  facts: z.array(iconLabel),
  amenities: z.array(iconLabel),
  included: z.array(iconLabel),
  rules: z.array(z.object({ icon, label: z.string(), value: z.string() })),
});

const homeSchema = z.object({
  hero: z.object({ image, alt: z.string(), title: z.string(), line: z.string() }),
  experiences: z.array(
    z.object({ label: z.string(), icon, image, alt: z.string(), size: z.enum(["large"]).optional() }),
  ),
  packages: z.array(z.object({ id: z.string(), name: z.string(), icon, includes: z.array(iconLabel) })),
  reviews: z.array(z.object({ quote: z.string(), name: z.string(), city: z.string() })),
  galleryStrip: z.array(z.object({ image, alt: z.string(), wide: z.boolean() })),
});

const gallerySchema = z
  .object({
    categories: z.array(z.string()).min(1),
    photos: z.array(
      z.object({
        image,
        caption: z.string(),
        alt: z.string(),
        categories: z.array(z.string()),
        cols: z.union([z.literal(1), z.literal(2)]),
        rows: z.union([z.literal(2), z.literal(3)]),
      }),
    ),
  })
  .superRefine((g, ctx) => {
    g.photos.forEach((p, i) =>
      p.categories.forEach((c) => {
        if (!g.categories.includes(c))
          ctx.addIssue({ code: "custom", path: ["photos", i, "categories"], message: `Unknown category "${c}"` });
      }),
    );
  });

const chatAction = z.union([
  z.enum(["enquire", "whatsapp", "call", "directions"]),
  z.object({ label: z.string(), href: z.string() }),
]);

const chatSchema = z
  .object({
    bot: z.object({
      name: z.string(),
      status: z.string(),
      welcome: z.string(),
      launcherHint: z.string(),
      moreTopicsLabel: z.string(),
      notFoundLine: z.string(),
    }),
    startTopics: z.array(z.string()).min(1),
    topics: z.array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
        question: z.string().min(1),
        faq: z.string().optional(),
        answer: z.string().min(1),
        next: z.array(z.string()).optional(),
        actions: z.array(chatAction).optional(),
      }),
    ),
  })
  .superRefine((chat, ctx) => {
    const ids = new Set<string>();
    chat.topics.forEach((t, i) => {
      if (ids.has(t.id)) ctx.addIssue({ code: "custom", path: ["topics", i, "id"], message: `Duplicate id "${t.id}"` });
      ids.add(t.id);
    });
    chat.startTopics.forEach((id, i) => {
      if (!ids.has(id)) ctx.addIssue({ code: "custom", path: ["startTopics", i], message: `No topic with id "${id}"` });
    });
    chat.topics.forEach((t, i) =>
      t.next?.forEach((id, j) => {
        if (!ids.has(id))
          ctx.addIssue({ code: "custom", path: ["topics", i, "next", j], message: `No topic with id "${id}"` });
      }),
    );
  });

const enquirySchema = z.object({
  title: z.string(),
  line: z.string(),
  stayTypes: z.array(z.object({ id: z.enum(["room", "package", "day-picnic", "not-sure"]), label: z.string(), icon })),
  budgets: z.array(z.object({ id: z.string(), label: z.string() })).min(1),
  budgetHint: z.string(),
  maxAdults: z.number().int().min(1),
  maxChildren: z.number().int().min(0),
  whatsappGreeting: z.string(),
  successTitle: z.string(),
  successLine: z.string(),
});

const policySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  title: z.string(),
  intro: z.string(),
  sections: z.array(z.object({ heading: z.string(), points: z.array(z.string()).min(1) })),
});

function load<T extends z.ZodType>(file: string, schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`content/${file} has a problem:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const site = load("site.json", siteSchema, siteJson);
export const rooms = load("rooms.json", z.array(roomSchema), roomsJson);
export const home = load("home.json", homeSchema, homeJson);
export const gallery = load("gallery.json", gallerySchema, galleryJson);
export const chat = load("chat-faq.json", chatSchema, chatJson);
export const enquiry = load("enquiry.json", enquirySchema, enquiryJson);
export const policies = load("policies.json", z.array(policySchema), policiesJson);

export type Site = typeof site;
export type Room = (typeof rooms)[number];
export type Package = (typeof home.packages)[number];
export type ChatContent = typeof chat;
export type EnquiryContent = typeof enquiry;

export const getRoom = (slug: string) => rooms.find((r) => r.slug === slug);

/** FAQ entries are the chat topics that have a `faq` question. */
export const faqs = chat.topics.filter((t) => t.faq).map((t) => ({ q: t.faq!, a: t.answer }));

export function priceLabel(price: number | null) {
  return price ? `₹${price.toLocaleString("en-IN")}` : site.priceFromLabel;
}
