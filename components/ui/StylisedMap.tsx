import { MapPin } from "lucide-react";
import styles from "./StylisedMap.module.css";

/**
 * Illustrated map from the designs (no third-party map script, so no cost and
 * no slowdown). "Get directions" buttons link to Google Maps for the real route.
 */
export function StylisedMap({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div className={`${styles.map} ${className}`}>
      <svg viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={styles.svg}>
        <path d="M-20 120 C 120 90, 200 180, 330 150 S 520 60, 640 110" className={styles.river} strokeWidth="44" />
        <path d="M-20 360 C 140 330, 240 380, 360 300 S 520 250, 640 280" className={styles.sand} strokeWidth="18" />
        <path d="M120 480 C 160 380, 260 300, 300 230 S 360 80, 420 -20" className={styles.road} strokeWidth="12" />
        <path
          d="M-20 250 C 100 260, 200 230, 300 230 S 500 220, 640 200"
          className={styles.road}
          strokeWidth="8"
          strokeDasharray="2 14"
        />
        <circle cx="300" cy="230" r="70" className={styles.halo} opacity="0.12" />
        <circle cx="300" cy="230" r="38" className={styles.halo} opacity="0.16" />
      </svg>
      <span className={styles.pin}>
        <span className={styles.pinLabel}>{name}</span>
        <MapPin size={40} strokeWidth={1.5} aria-hidden="true" className={styles.pinIcon} />
      </span>
      <span className={styles.left}>← Mumbai · Expressway</span>
      <span className={styles.right}>Pune →</span>
    </div>
  );
}
