import type { MetadataRoute } from "next";
import { policies, rooms, site } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString();
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/rooms"), changeFrequency: "monthly", priority: 0.9 },
    ...rooms.map((r) => ({ url: url(`/rooms/${r.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: url("/gallery"), changeFrequency: "monthly", priority: 0.6 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.7 },
    ...policies.map((p) => ({ url: url(`/policies/${p.slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
