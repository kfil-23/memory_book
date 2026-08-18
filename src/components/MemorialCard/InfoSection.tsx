import type { MemorialSection } from "../../types";
import { SectionIconRenderer } from "../SectionIconRenderer";
import styles from "./InfoSections.module.css";

export function InfoSection({ section }: { section: MemorialSection }) {
  const lines = section.content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className={styles.section}>
      <div className={styles.headerRow}>
        <SectionIconRenderer
          icon={section.icon}
          size={44}
          className={styles.icon}
        />
        <h2 className={styles.title}>{section.title}</h2>
      </div>
      <ul className={styles.list}>
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
