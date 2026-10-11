"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarCheck, Navigation, Phone, Sprout, X } from "lucide-react";
import type { ChatContent } from "@/lib/content";
import { waLink, waMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import type { ChatLinks } from "./ChatLauncher";
import styles from "./Chat.module.css";

type Topic = ChatContent["topics"][number];
type Action = NonNullable<Topic["actions"]>[number];
type Line = { from: "bot" | "guest"; text: string };
type Saved = { log: Line[]; current: string | null };

const STORAGE_KEY = "dk-chat";

/**
 * Click-through FAQ assistant. Guests never type: they tap a question, get the
 * answer, and see follow-up questions plus actions (enquire, WhatsApp, call,
 * directions). All content comes from content/chat-faq.json.
 */
export default function ChatPanel({
  chat,
  links,
  open,
  onClose,
}: {
  chat: ChatContent;
  links: ChatLinks;
  open: boolean;
  onClose: () => void;
}) {
  const byId = useMemo(() => new Map(chat.topics.map((t) => [t.id, t])), [chat.topics]);
  // Restore the conversation when the guest moves between pages (the panel only renders in the browser).
  const [saved] = useState<Saved>(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as Saved | null;
      if (s?.log?.length) return { log: s.log, current: s.current && byId.has(s.current) ? s.current : null };
    } catch {}
    return { log: [{ from: "bot", text: chat.bot.welcome }], current: null };
  });
  const [log, setLog] = useState<Line[]>(saved.log);
  const [current, setCurrent] = useState<string | null>(saved.current);
  const logRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // On mobile (see the ".backdrop" breakpoint in Chat.module.css) the panel is a true
  // modal bottom sheet with a blocking backdrop; on desktop it's a non-modal corner
  // widget. aria-modal must track that, or a screen-reader user on mobile can tab
  // into page content that's visually hidden behind the backdrop.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ log, current } satisfies Saved));
    } catch {}
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [log, current]);

  useEffect(() => {
    if (!open) return;
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const topic = current ? byId.get(current) : undefined;
  const nextIds = topic ? (topic.next ?? []) : chat.startTopics;
  const nextTopics = nextIds.map((id) => byId.get(id)).filter((t): t is Topic => !!t);

  const ask = (t: Topic) => {
    setLog((l) => [...l, { from: "guest", text: t.question }, { from: "bot", text: t.answer }]);
    setCurrent(t.id);
  };

  const handoff = waLink(links.whatsappNumber, waMessage.chat(topic ? topic.question.toLowerCase() : "planning a stay"));

  const renderAction = (a: Action, i: number) => {
    if (typeof a === "object") {
      return (
        <Link key={i} href={a.href} className={`chip ${styles.actionChip}`} onClick={onClose}>
          {a.label}
        </Link>
      );
    }
    switch (a) {
      case "enquire":
        return (
          <Link key={i} href="/contact#enquiry" className={`chip ${styles.actionChip}`} onClick={onClose}>
            <CalendarCheck size={16} strokeWidth={1.5} aria-hidden="true" />
            Plan an enquiry
          </Link>
        );
      case "whatsapp":
        return (
          <a key={i} href={handoff} target="_blank" rel="noopener" className={`chip ${styles.actionChip}`} data-wa-source="chat">
            <WhatsAppIcon size={16} />
            Ask on WhatsApp
          </a>
        );
      case "call":
        return (
          <a key={i} href={`tel:${links.phone}`} className={`chip ${styles.actionChip}`}>
            <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
            Call us
          </a>
        );
      case "directions":
        return (
          <a key={i} href={links.maps} target="_blank" rel="noopener" className={`chip ${styles.actionChip}`}>
            <Navigation size={16} strokeWidth={1.5} aria-hidden="true" />
            Get directions
          </a>
        );
    }
  };

  return (
    <>
      <div className={styles.backdrop} data-open={open} onClick={onClose} aria-hidden="true" />
      <section
        id="dk-chat"
        role="dialog"
        aria-modal={isMobile}
        aria-labelledby="dk-chat-title"
        className={styles.panel}
        data-open={open}
        hidden={!open}
      >
        <span className={styles.grabber} aria-hidden="true" />
        <header className={styles.head}>
          <span className={styles.avatar}>
            <Sprout size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className={styles.who}>
            <h2 id="dk-chat-title" ref={titleRef} tabIndex={-1}>
              {chat.bot.name} · DK Farms
            </h2>
            <span>{chat.bot.status}</span>
          </span>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close chat">
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        <div ref={logRef} className={styles.log} aria-live="polite">
          {log.map((line, i) => (
            <p key={i} className={line.from === "bot" ? styles.bot : styles.guest}>
              {line.text}
            </p>
          ))}
        </div>

        <div className={styles.options}>
          {topic?.actions && topic.actions.length > 0 && (
            <div className={styles.chips} role="group" aria-label="Next steps">
              {topic.actions.map(renderAction)}
            </div>
          )}
          {nextTopics.length > 0 && (
            <div className={styles.chips} role="group" aria-label="Questions">
              {nextTopics.map((t) => (
                <button key={t.id} type="button" className="chip" onClick={() => ask(t)}>
                  {t.question}
                </button>
              ))}
            </div>
          )}
          {topic && (
            <button type="button" className={styles.back} onClick={() => setCurrent(null)}>
              <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
              {chat.bot.moreTopicsLabel}
            </button>
          )}
        </div>

        <footer className={styles.foot}>
          <p>{chat.bot.notFoundLine}</p>
          <div className={styles.footBtns}>
            <a href={handoff} target="_blank" rel="noopener" className="btn btn--soft btn--block" data-wa-source="chat">
              <WhatsAppIcon size={18} />
              Continue on WhatsApp
            </a>
            <a href={`tel:${links.phone}`} className={`btn btn--sand ${styles.callBtn}`} aria-label="Call us">
              <Phone size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
        </footer>
      </section>
    </>
  );
}
