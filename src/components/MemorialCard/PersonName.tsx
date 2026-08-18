import { useRef } from "react";
import { useFitFontSize } from "../../hooks/useFitFontSize";
import styles from "./PersonName.module.css";

const MAX_PX = 56;
const MIN_PX = 44;

export function PersonName({ fullName }: { fullName: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  useFitFontSize(
    nameRef,
    wrapperRef,
    { maxPx: MAX_PX, minPx: MIN_PX, stepPx: 1 },
    [fullName],
  );

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <h1 ref={nameRef} className={styles.name}>
        {fullName || "ФИО участника"}
      </h1>
      <div className={styles.divider}>
        <span className={styles.line} />
        <svg
          className={styles.star}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 1.5l2.94 6.62 7.16.7-5.4 4.83 1.62 7.05L12 17.02l-6.32 3.68 1.62-7.05-5.4-4.83 7.16-.7L12 1.5z" />
        </svg>
        <span className={styles.line} />
      </div>
    </div>
  );
}
