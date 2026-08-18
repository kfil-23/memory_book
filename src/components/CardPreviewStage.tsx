import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./CardPreviewStage.module.css";

const DESIGN_WIDTH = 1672;
const DESIGN_HEIGHT = 895;

export function CardPreviewStage({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const nextScale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT, 1.4);
      setScale(nextScale > 0 ? nextScale : 1);
    });
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className={styles.outer}>
      <div
        className={styles.stage}
        style={{
          width: DESIGN_WIDTH * scale,
          height: DESIGN_HEIGHT * scale,
        }}
      >
        <div
          className={styles.scaler}
          style={{ transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
