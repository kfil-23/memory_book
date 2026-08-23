import { useState, type RefObject } from "react";
import { Download, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { EXPORT_WIDTH, EXPORT_HEIGHT, sanitizeFileName, downloadDataUrl } from "../../lib/cardExport";
import styles from "./EditorPanel.module.css";

export function ExportControls({
  cardRef,
  fullName,
  contentFits,
  onClear,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  fullName: string;
  contentFits: boolean;
  onClear?: () => void;
}) {
  const [isExporting, setIsExporting] = useState(false);

  async function captureDataUrl(format: "png" | "jpeg") {
    if (!cardRef.current) return null;
    const { toPng, toJpeg } = await import("html-to-image");
    const options = {
      pixelRatio: EXPORT_WIDTH / cardRef.current.offsetWidth,
      width: cardRef.current.offsetWidth,
      height: cardRef.current.offsetHeight,
      backgroundColor: format === "jpeg" ? "#ffffff" : undefined,
    };
    return format === "png"
      ? toPng(cardRef.current, options)
      : toJpeg(cardRef.current, { ...options, quality: 0.95 });
  }

  async function handleExport(format: "png" | "jpeg" | "pdf") {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      if (format === "pdf") {
        const [dataUrl, { default: jsPDF }] = await Promise.all([
          captureDataUrl("png"),
          import("jspdf"),
        ]);
        if (!dataUrl) return;
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [EXPORT_WIDTH, EXPORT_HEIGHT],
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
        pdf.save(`${sanitizeFileName(fullName)}.pdf`);
        return;
      }

      const dataUrl = await captureDataUrl(format);
      if (!dataUrl) return;
      const extension = format === "png" ? "png" : "jpg";
      downloadDataUrl(dataUrl, `${sanitizeFileName(fullName)}.${extension}`);
    } catch (error) {
      console.error("Ошибка экспорта карточки:", error);
      window.alert("Не удалось экспортировать карточку. Попробуйте ещё раз.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleClear() {
    if (onClear && window.confirm("Очистить карточку? Все введённые данные будут удалены.")) {
      onClear();
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Экспорт</h2>

      <div className={contentFits ? styles.fitOk : styles.fitWarning}>
        {contentFits ? (
          <>
            <CheckCircle2 size={16} strokeWidth={2} />
            Контент помещается
          </>
        ) : (
          <>
            <AlertTriangle size={16} strokeWidth={2} />
            Контент не помещается
          </>
        )}
      </div>
      {!contentFits && (
        <p className={styles.warningText}>
          Слишком много текста для одной карточки. Сократите содержание или
          создайте дополнительную страницу.
        </p>
      )}

      <div className={styles.exportButtons}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => handleExport("png")}
          disabled={isExporting}
        >
          <Download size={16} strokeWidth={2} />
          Скачать карточку (PNG)
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => handleExport("jpeg")}
          disabled={isExporting}
        >
          <Download size={16} strokeWidth={2} />
          Скачать JPG
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
        >
          <Download size={16} strokeWidth={2} />
          Скачать PDF
        </button>
      </div>

      {onClear && (
        <button type="button" className={styles.clearButton} onClick={handleClear}>
          <Trash2 size={16} strokeWidth={1.75} />
          Очистить карточку
        </button>
      )}
    </section>
  );
}
