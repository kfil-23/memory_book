import { User } from "lucide-react";
import type { ImageTransform } from "../../types";
import styles from "./Portrait.module.css";

export function Portrait({
  src,
  transform,
}: {
  src?: string;
  transform: ImageTransform;
}) {
  return (
    <div className={styles.frame}>
      {src ? (
        <img
          className={styles.image}
          src={src}
          alt="Фотография участника"
          style={{
            objectPosition: `${50 + transform.offsetX}% ${50 + transform.offsetY}%`,
            transform: `scale(${transform.scale})`,
          }}
        />
      ) : (
        <div className={styles.placeholder}>
          <User size={48} strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
