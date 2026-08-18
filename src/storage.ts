import type { MemorialPerson } from "./types";

const STORAGE_KEY = "koydokurya-memorial-card:v1";

type PersistedShape = {
  fullName: string;
  portraitTransform: MemorialPerson["portraitTransform"];
  background: Omit<MemorialPerson["background"], "image">;
  sections: MemorialPerson["sections"];
};

export function savePersonToStorage(person: MemorialPerson): void {
  const { image: _image, ...backgroundRest } = person.background;
  const payload: PersistedShape = {
    fullName: person.fullName,
    portraitTransform: person.portraitTransform,
    background: backgroundRest,
    sections: person.sections,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage может быть недоступен (приватный режим, квота) — тихо игнорируем
  }
}

export function loadPersonFromStorage(): PersistedShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedShape;
  } catch {
    return null;
  }
}

export function clearPersonStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // игнорируем
  }
}
