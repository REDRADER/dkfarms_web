"use client";

import { useRef } from "react";
import { Menu, X } from "lucide-react";
import { NavLinks } from "./NavLinks";
import styles from "./Header.module.css";

/** Mobile menu using the native popover API: light dismiss and Esc for free. */
export function MobileMenu({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = () => ref.current?.hidePopover();

  return (
    <>
      <button type="button" className={styles.menuBtn} popoverTarget="site-menu" aria-label="Open menu">
        <Menu size={22} strokeWidth={1.5} aria-hidden="true" />
      </button>
      <div ref={ref} id="site-menu" popover="auto" className={styles.sheet} aria-label="Menu">
        <div className={styles.sheetTop}>
          <span className={styles.sheetTitle}>Menu</span>
          <button type="button" className={styles.menuBtn} onClick={close} aria-label="Close menu">
            <X size={22} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile">
          <NavLinks className={styles.sheetLinks} onNavigate={close} />
        </nav>
        <div className={styles.sheetFoot} onClick={close}>
          {children}
        </div>
      </div>
    </>
  );
}
