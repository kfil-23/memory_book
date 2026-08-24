import { useEffect, useRef, useState, type FormEvent } from "react";
import { User, Plus, LogIn, LogOut, Search, Download } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { listPeople, getPerson, type PersonListItem, type PersonRecord } from "../../lib/peopleApi";
import { getErrorMessage } from "../../lib/errorMessage";
import { sanitizeFileName, downloadBlob } from "../../lib/cardExport";
import { MemorialCard } from "../MemorialCard/MemorialCard";
import styles from "./CardGallery.module.css";

// Полное разрешение печатных карточек (3344×1790) для 600+ карточек не
// помещается в память браузера разом — берём нативный размер карточки
// без апскейла, и бьём архив на части, чтобы пиковое потребление памяти
// не зависело от общего числа карточек в базе.
const BULK_PIXEL_RATIO = 1;
const BULK_BATCH_SIZE = 60;

function CardThumb({ portraitUrl }: { portraitUrl?: string | null }) {
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
    const total = people.length;
    const batchCount = Math.ceil(total / BULK_BATCH_SIZE);
    setBulkExport({ current: 0, total });
    let failedCount = 0;

    try {
      const [{ default: JSZip }, { toBlob }] = await Promise.all([
        import("jszip"),
        import("html-to-image"),
      ]);

      for (let batch = 0; batch < batchCount; batch += 1) {
        const start = batch * BULK_BATCH_SIZE;
        const end = Math.min(start + BULK_BATCH_SIZE, total);
        const zip = new JSZip();
        const usedNames = new Set<string>();

        for (let i = start; i < end; i += 1) {
          setBulkExport({ current: i + 1, total });
          try {
            const record = await getPerson(people[i].id);
            setBulkExportPerson(record);
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );

            const node = bulkExportRef.current;
            if (!node) continue;
            const blob = await toBlob(node, {
              pixelRatio: BULK_PIXEL_RATIO,
              width: node.offsetWidth,
              height: node.offsetHeight,
            });
            if (!blob) continue;

            const baseName = sanitizeFileName(record.fullName);
            let fileName = `${baseName}.png`;
            let suffix = 2;
            while (usedNames.has(fileName)) {
              fileName = `${baseName}_${suffix}.png`;
              suffix += 1;
            }
            usedNames.add(fileName);
            zip.file(fileName, blob);
          } catch (error) {
            failedCount += 1;
            console.error("Не удалось экспортировать карточку:", people[i].id, error);
          } finally {
            setBulkExportPerson(null);
          }
        }

        const zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
        const partSuffix = batchCount > 1 ? `_часть_${batch + 1}_из_${batchCount}` : "";
        downloadBlob(zipBlob, `Карточки_памяти${partSuffix}.zip`);
        // Даём браузеру освободить память предыдущего архива перед следующим батчем.
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (failedCount > 0) {
        window.alert(`Не удалось экспортировать ${failedCount} карточек. Остальные скачаны.`);
      }
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
