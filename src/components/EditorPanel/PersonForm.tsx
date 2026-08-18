import styles from "./EditorPanel.module.css";

export function PersonForm({
  fullName,
  onChange,
}: {
  fullName: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>ФИО участника</h2>
      <input
        type="text"
        className={styles.textInput}
        placeholder="Например: Агафонов Михаил Александрович"
        value={fullName}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}
