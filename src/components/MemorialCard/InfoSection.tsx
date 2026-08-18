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
      <SectionIconRenderer
        icon={section.icon}
        size={50}
        className={styles.icon}
      />
      <div className={styles.body}>
        <h2 className={styles.title}>{section.title}</h2>
        <ul className={styles.list}>
          {lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
