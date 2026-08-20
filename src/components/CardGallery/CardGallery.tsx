import { useEffect, useState, type FormEvent } from "react";
import { User, Plus, LogIn, LogOut, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { listPeople, type PersonListItem } from "../../lib/peopleApi";
import styles from "./CardGallery.module.css";

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
              {person.portraitUrl ? (
                <img src={person.portraitUrl} alt="" className={styles.thumbImage} />
              ) : (
                <User size={32} strokeWidth={1.5} className={styles.thumbPlaceholder} />
              )}
            </div>
            <span className={styles.cardName}>{person.fullName || "Без имени"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
