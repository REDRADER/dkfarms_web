"use client";

/** Opens the chat assistant from anywhere on the page. */
export function AskDiaButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("dk:open-chat"))}>
      {children}
    </button>
  );
}
