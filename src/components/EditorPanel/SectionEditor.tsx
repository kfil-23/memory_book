import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { MemorialSection } from "../../types";
import { SortableSectionCard } from "./SortableSectionCard";
import styles from "./EditorPanel.module.css";

export function SectionEditor({
  sections,
  onChange,
}: {
  sections: MemorialSection[];
  onChange: (sections: MemorialSection[]) => void;
}) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function updateSection(id: string, patch: Partial<MemorialSection>) {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeSection(id: string) {
    onChange(sections.filter((s) => s.id !== id));
  }

  function addSection() {
    const newSection: MemorialSection = {
      id: uuid(),
      title: "Новый раздел",
      icon: "Star",
      content: "",
      order: sections.length,
      isCustom: true,
    };
    onChange([...sections, newSection]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((s) => s.id === active.id);
    const newIndex = sorted.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((s, index) => ({
      ...s,
      order: index,
    }));
    onChange(reordered);
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Информационные разделы</h2>
      <p className={styles.hint}>
        Пустые разделы не будут показаны на карточке. Перетаскивайте разделы
        за иконку слева, чтобы изменить порядок.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sorted.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.sectionList}>
            {sorted.map((section) => (
              <SortableSectionCard
                key={section.id}
                section={section}
                onTitleChange={(title) => updateSection(section.id, { title })}
                onContentChange={(content) =>
                  updateSection(section.id, { content })
                }
                onRemove={() => removeSection(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button type="button" className={styles.addSectionButton} onClick={addSection}>
        <Plus size={16} strokeWidth={2} />
        Добавить раздел
      </button>
    </section>
  );
}
