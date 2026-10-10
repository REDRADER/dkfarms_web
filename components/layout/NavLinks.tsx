"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "./nav";

/** Main nav with the current page marked. Rendered inside <Suspense> by Header. */
export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul role="list" className={className}>
      {navLinks.map((l) => {
        const current = !l.href.includes("#") && pathname.startsWith(l.href);
        return (
          <li key={l.href}>
            <Link href={l.href} aria-current={current ? "page" : undefined} onClick={onNavigate}>
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Same links without the active state, shown while the client nav loads. */
export function NavLinksStatic({ className }: { className?: string }) {
  return (
    <ul role="list" className={className}>
      {navLinks.map((l) => (
        <li key={l.href}>
          <Link href={l.href}>{l.label}</Link>
        </li>
      ))}
    </ul>
  );
}
