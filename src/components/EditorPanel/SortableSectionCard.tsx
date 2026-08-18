import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { MemorialSection } from "../../types";
import { SectionIconRenderer } from "../SectionIconRenderer";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import styles from "./EditorPanel.module.css";

export function SortableSectionCard({
  section,
  onTitleChange,
  onContentChange,
  onRemove,
}: {
  section: MemorialSection;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sectionCard}>
      <div className={styles.sectionCardHeader}>
        <button
          type="button"
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          aria-label="Изменить порядок"
        >
          <GripVertical size={16} strokeWidth={1.75} />
        </button>
        <SectionIconRenderer icon={section.icon} size={17} />
        {section.isCustom ? (
          <input
            type="text"
            className={styles.sectionTitleInput}
            value={section.title}
            placeholder="Заголовок раздела"
            onChange={(event) => onTitleChange(event.target.value)}
          />
        ) : (
          <span className={styles.sectionCardTitle}>{section.title}</span>
        )}
        {section.isCustom && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onRemove}
            aria-label="Удалить раздел"
          >
            <Trash2 size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>
      <AutoResizeTextarea
        value={section.content}
        placeholder="Введите текст. Каждая новая строка станет отдельным пунктом."
        onChange={onContentChange}
      />
    </div>
  );
}
