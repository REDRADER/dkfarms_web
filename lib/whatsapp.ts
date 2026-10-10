/*
 * WhatsApp click-to-chat (free, no API). Every "Enquire" action opens WhatsApp
 * with a message already typed, so the guest only taps Send.
 * Message templates follow the design brief.
 */

export function waLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export const waMessage = {
  general: (resort: string) =>
    `Hi! I'd like to know more about staying at ${resort}. Check-in: __ Check-out: __ Guests: __`,
  room: (resort: string, room: string) =>
    `Hi! I'm interested in the ${room} at ${resort}. Please share availability and price for __ guests on __.`,
  package: (packageName: string) => `Hi! Please share details of the ${packageName} package for __ people on __.`,
  chat: (topic: string) => `Hi! I was chatting on your website about ${topic}. Can someone help me?`,
};

/** Where a WhatsApp click came from, sent to analytics as `source`. */
export type WaSource =
  | "header"
  | "hero"
  | "floating"
  | "bottom-bar"
  | "room-card"
  | "room-detail"
  | "package"
  | "chat"
  | "enquiry"
  | "contact"
  | "footer"
  | "cta";
