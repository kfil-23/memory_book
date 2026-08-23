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
    background: row.background,
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
 * Загружает в Storage изображение, если это data:-URL (новое, выбранное
 * пользователем локально), либо возвращает как есть, если это уже ссылка
 * на файл в Storage (изображение не менялось).
 */
async function resolveImageUrl(
  bucket: "portraits" | "backgrounds",
  personId: string,
  value: string | undefined,
): Promise<string | null> {
  if (!value) return null;
  if (!value.startsWith("data:")) return value;

  const blob = await (await fetch(value)).blob();
  const path = `${personId}/${bucket === "portraits" ? "portrait" : "background"}.jpg`;

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    upsert: true,
    contentType: blob.type || "image/jpeg",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function savePerson(
  person: MemorialPerson,
  id?: string,
): Promise<PersonRecord> {
  const personId = id ?? crypto.randomUUID();

  const [portraitUrl, backgroundImageUrl] = await Promise.all([
    resolveImageUrl("portraits", personId, person.portrait),
    resolveImageUrl("backgrounds", personId, person.background.image),
  ]);

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
