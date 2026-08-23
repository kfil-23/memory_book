import { supabase } from "./supabase";
import type { MemorialPerson } from "../types";

export type PersonListItem = {
  id: string;
  fullName: string;
  portraitUrl: string | null;
  updatedAt: string;
};

export type PersonRecord = MemorialPerson & {
  id: string;
  updatedAt: string;
};

type PeopleRow = {
  id: string;
  full_name: string;
  portrait_url: string | null;
  portrait_transform: MemorialPerson["portraitTransform"];
  background: MemorialPerson["background"];
  sections: MemorialPerson["sections"];
  updated_at: string;
};

function rowToPerson(row: PeopleRow): PersonRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    portrait: row.portrait_url ?? undefined,
    portraitTransform: row.portrait_transform,
    background: { ...row.background, theme: row.background?.theme ?? "light" },
    sections: row.sections,
    updatedAt: row.updated_at,
  };
}

export async function listPeople(): Promise<PersonListItem[]> {
  const { data, error } = await supabase
    .from("people")
    .select("id, full_name, portrait_url, updated_at")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    portraitUrl: row.portrait_url,
    updatedAt: row.updated_at,
  }));
}

export async function getPerson(id: string): Promise<PersonRecord> {
  const { data, error } = await supabase.from("people").select("*").eq("id", id).single();
  if (error) throw error;
  return rowToPerson(data as PeopleRow);
}

export async function deletePerson(id: string): Promise<void> {
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Повторяет попытку при сетевой ошибке (нестабильное соединение) —
 * загрузка файла с первого раза не всегда докачивается на медленном
 * интернете, но обычно проходит со 2-3 попытки.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Загружает в Storage изображение, если это data:-URL (новое, выбранное
 * пользователем локально), либо возвращает как есть, если это уже ссылка
 * на файл в Storage (изображение не менялось).
 *
 * Если сама загрузка файла не проходит (у части пользователей провайдер
 * рвёт именно такие запросы, а обычные JSON-запросы к таблице проходят
 * нормально) — не проваливаем сохранение целиком, а кладём сжатую
 * картинку прямо в запись таблицы как data:-URL. Так она едет тем же
 * путём, что и текст, который уже подтверждённо работает.
 */
async function resolveImageUrl(
  bucket: "portraits" | "backgrounds",
  personId: string,
  value: string | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (!value.startsWith("data:")) return value;

  const blob = await (await fetch(value)).blob();
  if (blob.size === 0) {
    throw new Error("Фото повреждено или пусто — выберите файл заново");
  }
  if (blob.size > 15 * 1024 * 1024) {
    throw new Error("Фото слишком большое даже после сжатия — попробуйте другой файл");
  }
  const path = `${personId}/${bucket === "portraits" ? "portrait" : "background"}.jpg`;

  try {
    await withRetry(async () => {
      const { error } = await supabase.storage.from(bucket).upload(path, blob, {
        upsert: true,
        contentType: blob.type || "image/jpeg",
      });
      if (error) throw error;
    });
  } catch (uploadError) {
    console.warn(
      `Загрузка фото в Storage (${bucket}) не прошла, сохраняем изображение прямо в записи`,
      uploadError,
    );
    return value;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function savePerson(
  person: MemorialPerson,
  id?: string,
): Promise<PersonRecord> {
  const personId = id ?? crypto.randomUUID();

  const portraitUrl = await resolveImageUrl("portraits", personId, person.portrait);
  const backgroundImageUrl = await resolveImageUrl(
    "backgrounds",
    personId,
    person.background.image,
  );

  const payload = {
    id: personId,
    full_name: person.fullName,
    portrait_url: portraitUrl,
    portrait_transform: person.portraitTransform,
    background: { ...person.background, image: backgroundImageUrl ?? undefined },
    sections: person.sections,
  };

  const { data, error } = await supabase
    .from("people")
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return rowToPerson(data as PeopleRow);
}
