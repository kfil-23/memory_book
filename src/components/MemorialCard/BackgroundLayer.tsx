import type { BackgroundSettings } from "../../types";
import styles from "./BackgroundLayer.module.css";

export function BackgroundLayer({ settings }: { settings: BackgroundSettings }) {
  if (!settings.image) {
    return <div className={styles.fallback} />;
  }

  return (
    <div className={styles.layer}>
      <div
        className={styles.image}
        style={{
          backgroundImage: `url(${settings.image})`,
          backgroundPosition: `${50 + settings.offsetX}% ${50 + settings.offsetY}%`,
          transform: `scale(${settings.scale * 1.01})`,
          filter: `blur(${settings.blur}px) brightness(${settings.brightness}) saturate(0.9)`,
        }}
      />
    </div>
  );
}
