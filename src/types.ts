export type ImageTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type CardTheme = "light" | "dark";

export type BackgroundSettings = {
  image?: string;
  scale: number;
  offsetX: number;
  offsetY: number;
  blur: number;
  brightness: number;
  theme: CardTheme;
};

export type SectionIcon =
  | "FileText"
  | "Shield"
  | "Medal"
  | "Folder"
  | "Info"
  | "Star";

export type MemorialSection = {
  id: string;
  key?: StandardSectionKey;
  title: string;
  icon: SectionIcon;
  content: string;
  order: number;
  isCustom: boolean;
};

export type StandardSectionKey = "mainInfo" | "service" | "awards" | "archive";

export type MemorialPerson = {
  fullName: string;
  portrait?: string;
  portraitTransform: ImageTransform;
  background: BackgroundSettings;
  sections: MemorialSection[];
};

export const DEFAULT_PORTRAIT_TRANSFORM: ImageTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  image: undefined,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  blur: 1.5,
  brightness: 0.97,
  theme: "light",
};

export const STANDARD_SECTION_DEFS: Record<
  StandardSectionKey,
  { title: string; icon: SectionIcon }
> = {
  mainInfo: { title: "Основные сведения", icon: "FileText" },
  service: { title: "Воинская служба", icon: "Shield" },
  awards: { title: "Боевые награды", icon: "Medal" },
  archive: { title: "Архивные источники", icon: "Folder" },
};
