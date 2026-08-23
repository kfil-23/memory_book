import type { ReactNode } from "react";
import type { BackgroundSettings } from "../../types";
import styles from "./GlassPanel.module.css";

export function GlassPanel({
  background,
  children,
}: {
  background: BackgroundSettings;
  children: ReactNode;
}) {
  return (
    <div className={styles.panel} data-theme={background.theme}>
      {background.image ? (
        <div
          className={styles.frostedImage}
          style={{
            backgroundImage: `url(${background.image})`,
            backgroundPosition: `${50 + background.offsetX}% ${50 + background.offsetY}%`,
            transform: `scale(${background.scale * 1.01})`,
            filter: `blur(${background.blur + 4}px) brightness(${background.brightness * 1.2}) saturate(0.85)`,
          }}
        />
      ) : (
        <div className={styles.frostedFallback} />
      )}
      <div className={styles.tint} />
      <div className={styles.grain} aria-hidden="true" />
      {children}
    </div>
  );
}
