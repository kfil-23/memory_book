import {
  DEFAULT_BACKGROUND_SETTINGS,
  DEFAULT_PORTRAIT_TRANSFORM,
  STANDARD_SECTION_DEFS,
  type MemorialPerson,
} from "./types";

export function createDemoPerson(): MemorialPerson {
  return {
    fullName: "Агафонов Михаил Александрович",
    portrait: undefined,
    portraitTransform: { ...DEFAULT_PORTRAIT_TRANSFORM },
    background: { ...DEFAULT_BACKGROUND_SETTINGS },
    sections: [
      {
        id: "mainInfo",
        key: "mainInfo",
        title: STANDARD_SECTION_DEFS.mainInfo.title,
        icon: STANDARD_SECTION_DEFS.mainInfo.icon,
        order: 0,
        isCustom: false,
        content:
          "Дата рождения: 12 октября 1926 г.\n" +
          "Место рождения: Архангельская обл., Холмогорский р-н, Верхняя Койдокурья.\n" +
          "Дата призыва: 13 декабря 1944 г.\n" +
          "Место призыва: Первомайский РВК, г. Архангельск.\n" +
          "Дата выбытия (демобилизации): 30 июля 1946 г.",
      },
      {
        id: "service",
        key: "service",
        title: STANDARD_SECTION_DEFS.service.title,
        icon: STANDARD_SECTION_DEFS.service.icon,
        order: 1,
        isCustom: false,
        content:
          "Воинские звания: красноармеец → техник-лейтенант → капитан.\n" +
          "Воинские части: 343 запасной стрелковый полк; 293 запасная стрелковая дивизия; 80 отдельный саперный батальон.",
      },
      {
        id: "awards",
        key: "awards",
        title: STANDARD_SECTION_DEFS.awards.title,
        icon: STANDARD_SECTION_DEFS.awards.icon,
        order: 2,
        isCustom: false,
        content:
          "Медаль «За боевые заслуги» (31.05.1945).\n" +
          "Медаль «За победу над Германией в Великой Отечественной войне 1941–1945 гг.».\n" +
          "Медаль «За победу над Японией».\n" +
          "Орден Отечественной войны II степени.",
      },
      {
        id: "archive",
        key: "archive",
        title: STANDARD_SECTION_DEFS.archive.title,
        icon: STANDARD_SECTION_DEFS.archive.icon,
        order: 3,
        isCustom: false,
        content: "ЦАМО.\n«Память народа».\n«Подвиг народа».\n«Мемориал».\n«Дорога Памяти».",
      },
    ],
  };
}

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
