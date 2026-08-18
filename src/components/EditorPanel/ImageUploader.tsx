import { useRef, type ChangeEvent } from "react";
import { ImagePlus, RotateCw, Trash2 } from "lucide-react";
import styles from "./ImageUploader.module.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  label,
  image,
  onChange,
  onRemove,
}: {
  label: string;
  image?: string;
  onChange: (dataUrl: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      window.alert("Поддерживаются форматы: JPG, JPEG, PNG, WEBP");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl);
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <div className={styles.thumb}>
          {image ? (
            <img src={image} alt="" className={styles.thumbImg} />
          ) : (
            <ImagePlus size={22} strokeWidth={1.5} className={styles.thumbIcon} />
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => inputRef.current?.click()}
          >
            <RotateCw size={15} strokeWidth={1.75} />
            {image ? "Заменить" : "Загрузить"}
          </button>
          {image && (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.danger}`}
              onClick={onRemove}
            >
              <Trash2 size={15} strokeWidth={1.75} />
              Удалить
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className={styles.hiddenInput}
        onChange={handleFileSelected}
      />
    </div>
  );
}
