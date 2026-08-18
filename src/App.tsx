import { useEffect, useRef, useState } from "react";
import { EditorPanel } from "./components/EditorPanel/EditorPanel";
import { MemorialCard } from "./components/MemorialCard/MemorialCard";
import { CardPreviewStage } from "./components/CardPreviewStage";
import { createDemoPerson, createEmptyPerson } from "./demoData";
import { loadPersonFromStorage, savePersonToStorage, clearPersonStorage } from "./storage";
import { STANDARD_SECTION_DEFS, type MemorialPerson } from "./types";
import styles from "./App.module.css";

function initPerson(): MemorialPerson {
  const persisted = loadPersonFromStorage();
  if (persisted) {
    const empty = createEmptyPerson();
    return {
      ...empty,
      fullName: persisted.fullName,
      portraitTransform: persisted.portraitTransform,
      background: { ...persisted.background, image: undefined },
      sections: persisted.sections.filter(
        (section) => section.isCustom || section.key === undefined || section.key in STANDARD_SECTION_DEFS,
      ),
    };
  }
  return createDemoPerson();
}

function App() {
  const [person, setPerson] = useState<MemorialPerson>(initPerson);
  const [contentFits, setContentFits] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => savePersonToStorage(person), 300);
    return () => clearTimeout(timeout);
  }, [person]);

  function handleClear() {
    clearPersonStorage();
    setPerson(createEmptyPerson());
  }

  return (
    <div className={styles.app}>
      <div className={styles.editorColumn}>
        <EditorPanel
          person={person}
          onChange={setPerson}
          cardRef={cardRef}
          contentFits={contentFits}
          onClear={handleClear}
        />
      </div>
      <div className={styles.previewColumn}>
        <CardPreviewStage>
          <MemorialCard ref={cardRef} person={person} onFitChange={setContentFits} />
        </CardPreviewStage>
      </div>
    </div>
  );
}

export default App;
