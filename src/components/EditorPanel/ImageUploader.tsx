import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, RotateCw, Trash2 } from "lucide-react";
import { resizeImageToDataUrl } from "../../lib/resizeImage";
import styles from "./ImageUploader.module.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ImageUploader({
  label,
  image,
  onChange,
  onRemove,
  maxDimension = 1800,
}: {
  label: string;
  image?: string;
  onChange: (dataUrl: string) => void;
  onRemove: () => void;
  maxDimension?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      window.alert("Поддерживаются форматы: JPG, JPEG, PNG, WEBP");
      return;
    }
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, maxDimension);
      onChange(dataUrl);
    } catch (error) {
      window.alert(
        "Не удалось обработать изображение: " +
          (error instanceof Error ? error.message : String(error)),
      );
    } finally {
      setIsProcessing(false);
    }
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
            disabled={isProcessing}
          >
            <RotateCw size={15} strokeWidth={1.75} />
            {isProcessing ? "Обработка…" : image ? "Заменить" : "Загрузить"}
          </button>
          {image && (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.danger}`}
              onClick={onRemove}
              disabled={isProcessing}
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
