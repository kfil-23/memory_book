import {
  DEFAULT_BACKGROUND_SETTINGS,
  DEFAULT_PORTRAIT_TRANSFORM,
  STANDARD_SECTION_DEFS,
  type MemorialPerson,
} from "./types";

export function createEmptyPerson(): MemorialPerson {
  return {
    fullName: "",
    portrait: undefined,
    portraitTransform: { ...DEFAULT_PORTRAIT_TRANSFORM },
    background: { ...DEFAULT_BACKGROUND_SETTINGS },
    sections: (
      Object.keys(STANDARD_SECTION_DEFS) as (keyof typeof STANDARD_SECTION_DEFS)[]
    ).map((key, index) => ({
      id: key,
      key,
      title: STANDARD_SECTION_DEFS[key].title,
      icon: STANDARD_SECTION_DEFS[key].icon,
      order: index,
      isCustom: false,
      content: "",
    })),
  };
}
