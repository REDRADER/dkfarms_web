import "server-only";
import type { Metadata } from "next";
import { images } from "@/content/images.generated";
import { faqs, rooms, site, type Room } from "@/lib/content";

const abs = (path: string) => new URL(path, site.url).toString();

/** Per-page metadata with canonical URL and social cards. */
export function pageMeta({
  title,
  description,
  path,
  image = "hero-valley",
}: {
  title?: string;
  description?: string;
  path: string;
  image?: string;
}): Metadata {
  const desc = description ?? site.description;
  const og = images[image];
  return {
    ...(title && { title }),
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: path,
      siteName: site.name,
      title: title ? `${title} · ${site.name}` : site.name,
      description: desc,
      images: og ? [{ url: og.src, width: og.width, height: og.height }] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

const address = {
  "@type": "PostalAddress",
  streetAddress: site.address.line,
  addressLocality: site.address.locality,
  addressRegion: site.address.region,
  postalCode: site.address.postalCode,
  addressCountry: site.address.country,
};

export function resortJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Resort",
    "@id": abs("/#resort"),
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phoneLink,
    email: site.email,
    image: abs(images["hero-valley"].src),
    address,
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    checkinTime: site.checkIn,
    checkoutTime: site.checkOut,
    petsAllowed: true,
    sameAs: [`https://instagram.com/${site.instagram}`],
    amenityFeature: site.highlights.map((h) => ({ "@type": "LocationFeatureSpecification", name: h.label, value: true })),
    containsPlace: rooms.map((r) => ({ "@id": abs(`/rooms/${r.slug}#room`) })),
    // Only publish a rating when it is real (count > 0), as Google requires.
    ...(site.rating.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: site.rating.value,
        reviewCount: site.rating.count,
        bestRating: 5,
      },
    }),
  };
}

export function roomJsonLd(room: Room) {
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    "@id": abs(`/rooms/${room.slug}#room`),
    name: room.name,
    description: room.detailLine,
    url: abs(`/rooms/${room.slug}`),
    image: room.photos.map((p) => abs(images[p.image].src)),
    bed: { "@type": "BedDetails", typeOfBed: room.bed, numberOfBeds: 1 },
    occupancy: { "@type": "QuantitativeValue", maxValue: room.guests },
    amenityFeature: room.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.label, value: true })),
    containedInPlace: { "@id": abs("/#resort") },
    ...(room.priceFrom && {
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: room.priceFrom,
        unitText: "night",
        availability: "https://schema.org/InStock",
      },
    }),
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}
