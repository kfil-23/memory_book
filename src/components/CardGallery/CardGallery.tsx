import { useEffect, useRef, useState, type FormEvent } from "react";
import { User, Plus, LogIn, LogOut, Search, Download } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { listPeople, getPerson, type PersonListItem, type PersonRecord } from "../../lib/peopleApi";
import { getErrorMessage } from "../../lib/errorMessage";
import { EXPORT_WIDTH, sanitizeFileName, downloadBlob } from "../../lib/cardExport";
import { MemorialCard } from "../MemorialCard/MemorialCard";
import styles from "./CardGallery.module.css";

function CardThumb({ portraitUrl }: { portraitUrl?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [portraitUrl]);

  if (!portraitUrl || failed) {
    return <User size={32} strokeWidth={1.5} className={styles.thumbPlaceholder} />;
  }

  return (
    <img
      src={portraitUrl}
      alt=""
      className={styles.thumbImage}
      onError={() => setFailed(true)}
    />
  );
}

export function CardGallery({
  onOpen,
  onCreate,
  reloadToken,
}: {
  onOpen: (id: string) => void;
  onCreate: () => void;
  reloadToken: number;
}) {
  const { isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const [people, setPeople] = useState<PersonListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [bulkExport, setBulkExport] = useState<{ current: number; total: number } | null>(null);
  const [bulkExportPerson, setBulkExportPerson] = useState<PersonRecord | null>(null);
  const bulkExportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    listPeople()
      .then((rows) => {
        if (!cancelled) setPeople(rows);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message ?? "Не удалось загрузить список карточек");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    const error = await login(password);
    setLoggingIn(false);
    if (error) {
      setLoginError(error);
      return;
    }
    setPassword("");
    setLoginOpen(false);
  }

  async function handleDownloadAll() {
    if (!people || people.length === 0) return;
    setBulkExport({ current: 0, total: people.length });
    try {
      const [{ default: JSZip }, { toPng }] = await Promise.all([
        import("jszip"),
        import("html-to-image"),
      ]);
      const zip = new JSZip();
      const usedNames = new Set<string>();

      for (let i = 0; i < people.length; i += 1) {
        setBulkExport({ current: i + 1, total: people.length });
        const record = await getPerson(people[i].id);
        setBulkExportPerson(record);
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const node = bulkExportRef.current;
        if (!node) continue;
        const dataUrl = await toPng(node, {
          pixelRatio: EXPORT_WIDTH / node.offsetWidth,
          width: node.offsetWidth,
          height: node.offsetHeight,
        });

        const baseName = sanitizeFileName(record.fullName);
        let fileName = `${baseName}.png`;
        let suffix = 2;
        while (usedNames.has(fileName)) {
          fileName = `${baseName}_${suffix}.png`;
          suffix += 1;
        }
        usedNames.add(fileName);
        zip.file(fileName, dataUrl.split(",")[1] ?? "", { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "Карточки_памяти.zip");
    } catch (error) {
      window.alert("Не удалось скачать карточки: " + getErrorMessage(error));
    } finally {
      setBulkExport(null);
      setBulkExportPerson(null);
    }
  }

  const filtered =
    people?.filter((person) =>
      person.fullName.toLowerCase().includes(query.trim().toLowerCase()),
    ) ?? null;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Книга памяти Койдокурьи</h1>
          <p className={styles.subtitle}>
            {people ? `Карточек в базе: ${people.length}` : "Загрузка…"}
          </p>
        </div>

        <div className={styles.authArea}>
          {authLoading ? null : isAuthenticated ? (
            <button type="button" className={styles.secondaryButton} onClick={logout}>
              <LogOut size={16} strokeWidth={2} />
              Выйти
            </button>
          ) : loginOpen ? (
            <form className={styles.loginForm} onSubmit={handleLoginSubmit}>
              <input
                type="password"
                autoFocus
                placeholder="Пароль редактора"
                className={styles.loginInput}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button type="submit" className={styles.primaryButton} disabled={loggingIn}>
                Войти
              </button>
            </form>
          ) : (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setLoginOpen(true)}
            >
              <LogIn size={16} strokeWidth={2} />
              Войти для редактирования
            </button>
          )}
        </div>
      </header>

      {loginError && <p className={styles.loginError}>{loginError}</p>}

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск по имени…"
            className={styles.searchInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {people && people.length > 0 && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleDownloadAll}
            disabled={!!bulkExport}
          >
            <Download size={16} strokeWidth={2} />
            {bulkExport
              ? `Скачивание ${bulkExport.current} из ${bulkExport.total}…`
              : "Скачать все карточки"}
          </button>
        )}

        {isAuthenticated && (
          <button type="button" className={styles.primaryButton} onClick={onCreate}>
            <Plus size={16} strokeWidth={2} />
            Новая карточка
          </button>
        )}
      </div>

      {loadError && <p className={styles.loadError}>{loadError}</p>}

      {filtered && filtered.length === 0 && !loadError && (
        <p className={styles.empty}>
          {people?.length === 0 ? "Карточек пока нет." : "Ничего не найдено."}
        </p>
      )}

      <div className={styles.grid}>
        {filtered?.map((person) => (
          <button
            key={person.id}
            type="button"
            className={styles.card}
            onClick={() => onOpen(person.id)}
          >
            <div className={styles.thumb}>
              <CardThumb portraitUrl={person.portraitUrl} />
            </div>
            <span className={styles.cardName}>{person.fullName || "Без имени"}</span>
          </button>
        ))}
      </div>

      {bulkExportPerson && (
        <div style={{ position: "fixed", top: 0, left: "-99999px" }} aria-hidden="true">
          <MemorialCard ref={bulkExportRef} person={bulkExportPerson} />
        </div>
      )}
    </div>
  );
}
