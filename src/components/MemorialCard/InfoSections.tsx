import { useEffect, useRef } from "react";
import type { MemorialSection } from "../../types";
import { useFitDensity } from "../../hooks/useFitDensity";
import { InfoSection } from "./InfoSection";
import styles from "./InfoSections.module.css";

export function InfoSections({
  sections,
  onFitChange,
}: {
  sections: MemorialSection[];
  onFitChange?: (fits: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filled = sections
    .filter((section) => section.content.trim().length > 0)
    .sort((a, b) => a.order - b.order);

  const { density, fits } = useFitDensity(containerRef, contentRef, [
    JSON.stringify(filled.map((s) => [s.id, s.title, s.content])),
  ]);

  useEffect(() => {
    onFitChange?.(fits);
  }, [fits, onFitChange]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div ref={contentRef} className={styles.content} data-density={density}>
        {filled.map((section) => (
          <InfoSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
