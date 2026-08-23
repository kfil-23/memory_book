import type { ImageTransform } from "../../types";
import { ImageUploader } from "./ImageUploader";
import { SliderField } from "./SliderField";
import styles from "./EditorPanel.module.css";

export function PortraitPanel({
  image,
  transform,
  onImageChange,
  onImageRemove,
  onTransformChange,
}: {
  image?: string;
  transform: ImageTransform;
  onImageChange: (dataUrl: string) => void;
  onImageRemove: () => void;
  onTransformChange: (transform: ImageTransform) => void;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Фотография участника</h2>
      <ImageUploader
        label="Портрет"
        image={image}
        onChange={onImageChange}
        onRemove={onImageRemove}
        maxDimension={1800}
      />
      {image && (
        <div className={styles.sliderGroup}>
          <SliderField
            label="Масштаб"
            min={1}
            max={2.5}
            step={0.05}
            value={transform.scale}
            onChange={(scale) => onTransformChange({ ...transform, scale })}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <SliderField
            label="Смещение влево/вправо"
            min={-50}
            max={50}
            step={1}
            value={transform.offsetX}
            onChange={(offsetX) => onTransformChange({ ...transform, offsetX })}
          />
          <SliderField
            label="Смещение вверх/вниз"
            min={-50}
            max={50}
            step={1}
            value={transform.offsetY}
            onChange={(offsetY) => onTransformChange({ ...transform, offsetY })}
          />
        </div>
      )}
    </section>
  );
}
