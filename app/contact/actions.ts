"use server";

import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { z } from "zod";
import { enquiry as enquiryContent, home, rooms, site } from "@/lib/content";
import { enquirySchema, summarize, type EnquiryOptions } from "@/lib/enquiry";

export type SendResult = { ok: true } | { ok: false; error: string };

const options: EnquiryOptions = {
  stayTypes: enquiryContent.stayTypes,
  rooms: rooms.map((r) => ({ id: r.slug, label: r.name })),
  packages: home.packages.map((p) => ({ id: p.id, label: p.name })),
  budgets: enquiryContent.budgets,
};

// Best-effort spam brake: 5 emails per IP per 10 minutes, per server instance.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const recent = new Map<string, number[]>();

function rateLimited(ip: string, now: number) {
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > LIMIT;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Emails an enquiry from the website's Gmail account to the resort.
 * Credentials come from server-only env vars (GMAIL_USER, GMAIL_APP_PASSWORD),
 * so neither the address nor the password ever reaches the browser.
 */
export async function sendEnquiryEmail(
  input: unknown,
  meta: { startedAt: number; company: string },
): Promise<SendResult> {
  const now = Date.now();

  // Bots fill the hidden "company" field and submit instantly; pretend success.
  if (meta.company || now - meta.startedAt < 3000) return { ok: true };

  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: z.prettifyError(parsed.error) };
  }
  const e = parsed.data;
  if (e.stayType === "room" && e.rooms.some((r) => !options.rooms.some((o) => o.id === r))) {
    return { ok: false, error: "Unknown room selected." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (rateLimited(ip, now)) {
    return { ok: false, error: "Too many enquiries from this connection. Please try WhatsApp instead." };
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("Enquiry email is not configured: set GMAIL_USER and GMAIL_APP_PASSWORD.");
    return { ok: false, error: "Email isn't available right now. Please send your enquiry on WhatsApp." };
  }

  const rows = summarize(e, options);
  const what = rows.find(([k]) => k === "Room" || k === "Package")?.[1] ?? rows[0][1];
  const when = rows.find(([k]) => k === "Check-in" || k === "Date")?.[1] ?? "";
  const subject = `New enquiry: ${what} · ${when} · ${e.name}`;

  const text = [`New enquiry from the ${site.name} website`, "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#2f3a33">
      <h2 style="font-weight:500">New enquiry from the ${escapeHtml(site.name)} website</h2>
      <table cellpadding="8" style="border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="color:#4e5b52;vertical-align:top">${escapeHtml(k)}</td><td style="white-space:pre-wrap"><strong>${escapeHtml(v)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <p style="color:#4e5b52">Reply to this email${e.email ? "" : " is not possible (no email given)"}; call or WhatsApp ${escapeHtml(e.phone)}.</p>
    </div>`;

  try {
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await transport.sendMail({
      from: { name: `${site.name} website`, address: user },
      to: process.env.ENQUIRY_TO || user,
      replyTo: e.email || undefined,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error("Enquiry email failed:", err);
    return { ok: false, error: "We couldn't send the email just now. Please try WhatsApp instead." };
  }
}
