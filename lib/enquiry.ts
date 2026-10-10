import { z } from "zod";

/*
 * The enquiry wizard's data, shared by the browser (to build the WhatsApp
 * message) and the server action (to validate and email it), so both always
 * describe an enquiry the same way.
 */

export const stayTypeIds = ["room", "package", "day-picnic", "not-sure"] as const;
export type StayType = (typeof stayTypeIds)[number];

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date");

export const enquirySchema = z
  .object({
    stayType: z.enum(stayTypeIds),
    rooms: z.array(z.string()).max(10),
    packageId: z.string().optional(),
    checkIn: isoDate,
    checkOut: isoDate.optional(),
    adults: z.number().int().min(1).max(200),
    children: z.number().int().min(0).max(200),
    pets: z.boolean(),
    budget: z.string().min(1, "Pick a budget"),
    name: z.string().trim().min(2, "Please enter your name").max(80),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s-]{10,16}$/, "Enter a valid phone number"),
    email: z.union([z.literal(""), z.email("Enter a valid email")]).optional(),
    message: z.string().trim().max(1000).optional(),
  })
  .refine((d) => d.stayType === "day-picnic" || (d.checkOut && d.checkOut > d.checkIn), {
    path: ["checkOut"],
    message: "Check-out must be after check-in",
  })
  .refine((d) => d.stayType !== "package" || !!d.packageId, { path: ["packageId"], message: "Pick a package" });

export type Enquiry = z.infer<typeof enquirySchema>;

export type Option = { id: string; label: string };
export type EnquiryOptions = {
  stayTypes: Option[];
  rooms: Option[];
  packages: Option[];
  budgets: Option[];
};

const labelOf = (list: Option[], id?: string) => list.find((o) => o.id === id)?.label ?? id ?? "";

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  // Built from parts (not `new Date(iso)`) so the day never shifts with time zones.
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function nights(e: Pick<Enquiry, "checkIn" | "checkOut">) {
  if (!e.checkOut) return 0;
  return Math.round((Date.parse(e.checkOut) - Date.parse(e.checkIn)) / 86_400_000);
}

/** Human-readable rows, used for the review step, the WhatsApp text and the email. */
export function summarize(e: Enquiry, o: EnquiryOptions): [string, string][] {
  const rows: [string, string][] = [["Looking for", labelOf(o.stayTypes, e.stayType)]];
  if (e.stayType === "room") {
    rows.push(["Room", e.rooms.length ? e.rooms.map((r) => labelOf(o.rooms, r)).join(", ") : "Any, please suggest"]);
  }
  if (e.stayType === "package") rows.push(["Package", labelOf(o.packages, e.packageId)]);
  if (e.stayType === "day-picnic") {
    rows.push(["Date", formatDate(e.checkIn)]);
  } else {
    const n = nights(e);
    rows.push(["Check-in", formatDate(e.checkIn)]);
    if (e.checkOut) rows.push(["Check-out", `${formatDate(e.checkOut)} (${n} night${n === 1 ? "" : "s"})`]);
  }
  const guests = [`${e.adults} adult${e.adults === 1 ? "" : "s"}`];
  if (e.children) guests.push(`${e.children} child${e.children === 1 ? "" : "ren"}`);
  if (e.pets) guests.push("with pet");
  rows.push(["Guests", guests.join(", ")]);
  rows.push(["Budget", labelOf(o.budgets, e.budget)]);
  rows.push(["Name", e.name]);
  rows.push(["Phone", e.phone]);
  if (e.email) rows.push(["Email", e.email]);
  if (e.message) rows.push(["Message", e.message]);
  return rows;
}

export function whatsappText(e: Enquiry, o: EnquiryOptions, greeting: string) {
  return [greeting, "", ...summarize(e, o).map(([k, v]) => `${k}: ${v}`)].join("\n");
}
