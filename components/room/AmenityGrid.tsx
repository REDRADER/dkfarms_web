import type { Room } from "@/lib/content";
import { Icon } from "@/components/icons";
import styles from "./AmenityGrid.module.css";

/** White amenity tiles (icon + label), four to a row. `lg` is the room-detail size. */
export function AmenityGrid({
  items,
  size = "md",
  className = "",
}: {
  items: Room["amenities"];
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <ul role="list" className={`${styles.grid} ${size === "lg" ? styles.lg : ""} ${className}`}>
      {items.map((a) => (
        <li key={a.label}>
          <span className="icon-badge">
            <Icon name={a.icon} size={size === "lg" ? 24 : 22} />
          </span>
          {a.label}
        </li>
      ))}
    </ul>
  );
}
