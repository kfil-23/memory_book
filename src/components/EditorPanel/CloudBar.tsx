import { ArrowLeft, Save, Trash2 } from "lucide-react";
import styles from "./CloudBar.module.css";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function CloudBar({
  isAuthenticated,
  isExistingCard,
  saveStatus,
  saveErrorMessage,
  onBack,
  onSave,
  onDelete,
}: {
  isAuthenticated: boolean;
  isExistingCard: boolean;
  saveStatus: SaveStatus;
  saveErrorMessage?: string;
  onBack: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.row}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={16} strokeWidth={2} />
          К списку карточек
        </button>

        {isAuthenticated && (
          <div className={styles.actions}>
            {isExistingCard && (
              <button type="button" className={styles.deleteButton} onClick={onDelete}>
                <Trash2 size={14} strokeWidth={2} />
                Удалить
              </button>
            )}
            <button
              type="button"
              className={styles.saveButton}
              onClick={onSave}
              disabled={saveStatus === "saving"}
            >
              <Save size={16} strokeWidth={2} />
              {saveStatus === "saving" ? "Сохранение…" : "Сохранить в базу"}
            </button>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <p className={styles.readOnlyNotice}>
          Режим просмотра — войдите как редактор, чтобы менять и сохранять карточку.
        </p>
      )}

      {saveStatus === "saved" && <span className={`${styles.status} ${styles.statusOk}`}>Сохранено</span>}
      {saveStatus === "error" && (
        <span className={`${styles.status} ${styles.statusError}`}>
          Ошибка сохранения{saveErrorMessage ? `: ${saveErrorMessage}` : ""}
        </span>
      )}
    </div>
  );
}
