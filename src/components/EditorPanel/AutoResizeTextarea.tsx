import { useLayoutEffect, useRef } from "react";
import styles from "./EditorPanel.module.css";

export function AutoResizeTextarea({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      className={styles.textarea}
      placeholder={placeholder}
      value={value}
      rows={3}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
