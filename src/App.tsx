import { useEffect, useRef, useState } from "react";
import { EditorPanel } from "./components/EditorPanel/EditorPanel";
import { CloudBar } from "./components/EditorPanel/CloudBar";
import type { SaveStatus } from "./components/EditorPanel/CloudBar";
import { MemorialCard } from "./components/MemorialCard/MemorialCard";
import { CardPreviewStage } from "./components/CardPreviewStage";
import { CardGallery } from "./components/CardGallery/CardGallery";
import { createEmptyPerson } from "./demoData";
import { useAuth } from "./hooks/useAuth";
import { getPerson, savePerson, deletePerson } from "./lib/peopleApi";
import type { MemorialPerson } from "./types";
import styles from "./App.module.css";

type View = "gallery" | "editor";

function App() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>("gallery");
  const [galleryReloadToken, setGalleryReloadToken] = useState(0);

  const [person, setPerson] = useState<MemorialPerson>(createEmptyPerson);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [contentFits, setContentFits] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | undefined>(undefined);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timeout = setTimeout(() => setSaveStatus("idle"), 2500);
    return () => clearTimeout(timeout);
  }, [saveStatus]);

  function openGallery() {
    setView("gallery");
  }

  function handleCreate() {
    setPerson(createEmptyPerson());
    setCurrentId(undefined);
    setSaveStatus("idle");
    setView("editor");
  }

  async function handleOpen(id: string) {
    setView("editor");
    setSaveStatus("idle");
    try {
      const record = await getPerson(id);
      setCurrentId(record.id);
      setPerson({
        fullName: record.fullName,
        portrait: record.portrait,
        portraitTransform: record.portraitTransform,
        background: record.background,
        sections: record.sections,
      });
    } catch (error) {
      window.alert(
        "Не удалось загрузить карточку: " +
          (error instanceof Error ? error.message : String(error)),
      );
      setView("gallery");
    }
  }

  async function handleSave() {
    setSaveStatus("saving");
    setSaveErrorMessage(undefined);
    try {
      const record = await savePerson(person, currentId);
      setCurrentId(record.id);
      setPerson({
        fullName: record.fullName,
        portrait: record.portrait,
        portraitTransform: record.portraitTransform,
        background: record.background,
        sections: record.sections,
      });
      setSaveStatus("saved");
      setGalleryReloadToken((token) => token + 1);
    } catch (error) {
      setSaveStatus("error");
      setSaveErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }

  async function handleDelete() {
    if (!currentId) return;
    if (!window.confirm("Удалить эту карточку из базы без возможности восстановления?")) return;
    try {
      await deletePerson(currentId);
      setGalleryReloadToken((token) => token + 1);
      openGallery();
    } catch (error) {
      window.alert(
        "Не удалось удалить карточку: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  if (view === "gallery") {
    return (
      <CardGallery onOpen={handleOpen} onCreate={handleCreate} reloadToken={galleryReloadToken} />
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.editorColumn}>
        <CloudBar
          isAuthenticated={isAuthenticated}
          isExistingCard={!!currentId}
          saveStatus={saveStatus}
          saveErrorMessage={saveErrorMessage}
          onBack={openGallery}
          onSave={handleSave}
          onDelete={handleDelete}
        />
        <EditorPanel
          person={person}
          onChange={setPerson}
          cardRef={cardRef}
          contentFits={contentFits}
          onClear={() => setPerson(createEmptyPerson())}
          editable={isAuthenticated}
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
