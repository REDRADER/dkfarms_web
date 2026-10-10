"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MessageSquareMore } from "lucide-react";
import type { ChatContent } from "@/lib/content";
import styles from "./Chat.module.css";

export type ChatLinks = { whatsappNumber: string; phone: string; maps: string };

const loadPanel = () => import("./ChatPanel");
// The panel is only downloaded when the guest first opens the chat.
const ChatPanel = dynamic(loadPanel, { ssr: false });

export function ChatLauncher({ chat, links }: { chat: ChatContent; links: ChatLinks }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    launcher.current?.focus();
  }, []);

  useEffect(() => {
    // Other parts of the page (e.g. the FAQ "Ask Dia" link) can open the chat.
    const onOpen = () => {
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener("dk:open-chat", onOpen);
    return () => window.removeEventListener("dk:open-chat", onOpen);
  }, []);

  return (
    <div className={styles.dock} data-open={open}>
      {mounted && <ChatPanel chat={chat} links={links} open={open} onClose={close} />}
      <div className={styles.launcherRow}>
        <button
          ref={launcher}
          type="button"
          className={styles.launcher}
          aria-label={open ? "Close chat assistant" : `Open chat assistant ${chat.bot.name}`}
          aria-expanded={open}
          aria-controls="dk-chat"
          onPointerEnter={loadPanel}
          onFocus={loadPanel}
          onClick={() => {
            setMounted(true);
            setOpen((o) => !o);
          }}
        >
          <MessageSquareMore size={26} strokeWidth={1.5} aria-hidden="true" />
        </button>
        {!open && (
          <span className={styles.hint} aria-hidden="true">
            {chat.bot.launcherHint}
          </span>
        )}
      </div>
    </div>
  );
}
