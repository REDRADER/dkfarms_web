import Link from "next/link";
import { Sprout } from "lucide-react";
import styles from "./Logo.module.css";

export function Logo({ name, inverted = false }: { name: string; inverted?: boolean }) {
  return (
    <Link href="/" className={`${styles.logo} ${inverted ? styles.inverted : ""}`} aria-label={`${name} home`}>
      <Sprout size={26} strokeWidth={1.5} aria-hidden="true" className={styles.mark} />
      <span className={styles.word}>{name}</span>
    </Link>
  );
}
