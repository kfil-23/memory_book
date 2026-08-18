import type { RefObject } from "react";
import type { MemorialPerson } from "../../types";
import { PersonForm } from "./PersonForm";
import { PortraitPanel } from "./PortraitPanel";
import { BackgroundPanel } from "./BackgroundPanel";
import { SectionEditor } from "./SectionEditor";
import { ExportControls } from "./ExportControls";
import styles from "./EditorPanel.module.css";

export function EditorPanel({
  person,
  onChange,
  cardRef,
  contentFits,
  onClear,
}: {
  person: MemorialPerson;
  onChange: (person: MemorialPerson) => void;
  cardRef: RefObject<HTMLDivElement | null>;
  contentFits: boolean;
  onClear: () => void;
}) {
  return (
    <div className={styles.panel}>
      <h1 className={styles.appTitle}>Книга памяти Койдокурьи</h1>
      <p className={styles.appSubtitle}>Генератор мемориальных карточек</p>

      <PersonForm
        fullName={person.fullName}
        onChange={(fullName) => onChange({ ...person, fullName })}
      />

      <PortraitPanel
        image={person.portrait}
        transform={person.portraitTransform}
        onImageChange={(portrait) => onChange({ ...person, portrait })}
        onImageRemove={() => onChange({ ...person, portrait: undefined })}
        onTransformChange={(portraitTransform) =>
          onChange({ ...person, portraitTransform })
        }
      />

      <BackgroundPanel
        settings={person.background}
        onImageChange={(image) =>
          onChange({ ...person, background: { ...person.background, image } })
        }
        onImageRemove={() =>
          onChange({
            ...person,
            background: { ...person.background, image: undefined },
          })
        }
        onSettingsChange={(background) => onChange({ ...person, background })}
      />

      <SectionEditor
        sections={person.sections}
        onChange={(sections) => onChange({ ...person, sections })}
      />

      <ExportControls
        cardRef={cardRef}
        fullName={person.fullName}
        contentFits={contentFits}
        onClear={onClear}
      />
    </div>
  );
}
