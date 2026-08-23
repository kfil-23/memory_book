import type { BackgroundSettings } from "../../types";
import { ImageUploader } from "./ImageUploader";
import { SliderField } from "./SliderField";
import styles from "./EditorPanel.module.css";

export function BackgroundPanel({
  settings,
  onImageChange,
  onImageRemove,
  onSettingsChange,
}: {
  settings: BackgroundSettings;
  onImageChange: (dataUrl: string) => void;
  onImageRemove: () => void;
  onSettingsChange: (settings: BackgroundSettings) => void;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Фоновое изображение</h2>
      <p className={styles.hint}>
        Дом участника, деревня, Койдокурья или местность — фон занимает всю
        карточку.
      </p>
      <ImageUploader
        label="Фон"
        image={settings.image}
        onChange={onImageChange}
        onRemove={onImageRemove}
        maxDimension={2400}
      />
      {settings.image && (
        <div className={styles.sliderGroup}>
          <SliderField
            label="Масштаб"
            min={1}
            max={2}
            step={0.05}
            value={settings.scale}
            onChange={(scale) => onSettingsChange({ ...settings, scale })}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <SliderField
            label="Смещение влево/вправо"
            min={-50}
            max={50}
            step={1}
            value={settings.offsetX}
            onChange={(offsetX) => onSettingsChange({ ...settings, offsetX })}
          />
          <SliderField
            label="Смещение вверх/вниз"
            min={-50}
            max={50}
            step={1}
            value={settings.offsetY}
            onChange={(offsetY) => onSettingsChange({ ...settings, offsetY })}
          />
          <SliderField
            label="Размытие"
            min={0}
            max={3}
            step={0.5}
            value={settings.blur}
            onChange={(blur) => onSettingsChange({ ...settings, blur })}
            formatValue={(v) => `${v} px`}
          />
          <SliderField
            label="Затемнение / осветление"
            min={0.5}
            max={1.3}
            step={0.05}
            value={settings.brightness}
            onChange={(brightness) =>
              onSettingsChange({ ...settings, brightness })
            }
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
        </div>
      )}
    </section>
  );
}
