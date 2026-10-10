import { Navigation } from "lucide-react";
import { site } from "@/lib/content";
import { Icon } from "@/components/icons";
import { StylisedMap } from "@/components/ui/StylisedMap";
import styles from "./LocationCard.module.css";

export function LocationCard() {
  return (
    <div className={`card reveal ${styles.card}`}>
      <div className={styles.text}>
        <h2 className="t-h2">Closer than you think</h2>
        <p className="t-muted">{site.nearLabel}</p>
        <ul role="list" className={styles.drives}>
          {site.driveTimes.slice(0, 2).map((d, i) => (
            <li key={d.from}>
              <span className={`icon-badge ${i % 2 ? "" : "icon-badge--sand"}`}>
                <Icon name={d.icon} size={20} />
              </span>
              <span>
                {d.from} <strong>· {d.time}</strong>
              </span>
            </li>
          ))}
        </ul>
        <a className="btn" href={site.mapsUrl} target="_blank" rel="noopener">
          <Navigation size={18} strokeWidth={1.5} aria-hidden="true" />
          Get directions
        </a>
      </div>
      <StylisedMap name={site.name} className={styles.map} />
    </div>
  );
}
