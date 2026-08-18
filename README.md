# Книга памяти Койдокурьи — генератор карточек

Веб-сервис для сборки мемориальных карточек участников Великой Отечественной
войны по единому дизайн-шаблону. Вся вёрстка карточки — чистые HTML/CSS/SVG,
без генеративного ИИ; текст всегда отображается точно и без искажений.

## Запуск

```bash
npm install
npm run dev
```

Приложение полностью локальное: без backend, без авторизации, без базы
данных и без внешних API. Фотографии пользователя не покидают браузер.
Данные формы сохраняются в `localStorage`; загруженные изображения — только
в памяти текущей сессии.

## Структура проекта

```
src/
  types.ts                 — типы данных (MemorialPerson, MemorialSection, ...)
  demoData.ts               — демо-данные и «пустой» участник
  storage.ts                — сохранение/чтение localStorage
  hooks/
    useFitFontSize.ts        — подбор размера шрифта ФИО под 2 строки
    useFitContent.ts          — авто-уменьшение отступов/шрифта разделов под высоту карточки
  components/
    SectionIconRenderer.tsx  — маппинг ключа иконки на компонент lucide-react
    CardPreviewStage.tsx      — масштабирование карточки (1600×900) под размер окна
    MemorialCard/             — сама карточка (то, что экспортируется в PNG/JPG/PDF)
      MemorialCard.tsx
      BackgroundLayer.tsx      — фоновая фотография (blur/brightness)
      GlassPanel.tsx           — стеклянная подложка (glassmorphism)
      PersonName.tsx           — ФИО с автоподбором размера шрифта
      InfoSections.tsx / InfoSection.tsx — информационные блоки
      Portrait.tsx             — портрет участника
      StGeorgeRibbon.tsx       — георгиевская лента (инлайн SVG)
    EditorPanel/               — левая колонка редактора
      EditorPanel.tsx
      PersonForm.tsx
      PortraitPanel.tsx / BackgroundPanel.tsx — загрузка фото + настройки позиции
      ImageUploader.tsx / SliderField.tsx
      SectionEditor.tsx / SortableSectionCard.tsx — разделы + drag-and-drop (@dnd-kit)
      AutoResizeTextarea.tsx
      ExportControls.tsx       — экспорт PNG/JPG/PDF, индикатор переполнения, очистка
  App.tsx                     — состояние приложения, сборка редактора и предпросмотра
```

## Использованные библиотеки

- **React + TypeScript + Vite** — основа приложения.
- **html-to-image** — экспорт DOM-карточки в PNG/JPG высокого разрешения.
- **jspdf** — необязательный экспорт в PDF (карточка встраивается как изображение).
- **lucide-react** — контурные иконки разделов.
- **@dnd-kit/core, @dnd-kit/sortable** — drag-and-drop сортировка разделов.
- **@fontsource/montserrat** — шрифт Montserrat, подключён локально (без внешних CDN).
- **uuid** — идентификаторы пользовательских разделов.
- CSS Modules — стили каждого компонента изолированы в своём `*.module.css`.

## Где искать стили карточки

Вся визуальная часть карточки лежит в `src/components/MemorialCard/*.module.css`.
Дизайн-размер карточки фиксирован: **1600×900** (соотношение 16:9), экспорт
идёт с `pixelRatio`, увеличивающим итог до **3200×1800**. Логический размер
задан константами `DESIGN_WIDTH`/`DESIGN_HEIGHT` в
`src/components/CardPreviewStage.tsx` и константой `EXPORT_WIDTH/HEIGHT` в
`src/components/EditorPanel/ExportControls.tsx` — их стоит менять вместе.

## Как изменить базовые параметры

- **Позиции и размеры блоков** (ФИО, стеклянная панель, портрет, лента,
  область текста) — проценты `left/top/width/height` в соответствующих
  `*.module.css` внутри `MemorialCard/`.
- **Цвета текста и акцента** — `#111111` (ФИО), `#151515` (текст блоков),
  `#C28A20` (золотой акцент) заданы прямо в `PersonName.module.css` и
  `InfoSections.module.css`.
- **Прозрачность и размытие стеклянной панели** — свойства `background`
  (rgba) и `backdrop-filter: blur(...)` в `GlassPanel.module.css`.
- **Размеры шрифтов**:
  - ФИО — константы `MAX_PX`/`MIN_PX` в `PersonName.tsx` (по умолчанию 68–48 px);
  - текст разделов — `min`/`max` значения внутри `calc()` в
    `InfoSections.module.css` (нижняя граница 18 px для текста, 24 px для
    заголовков — как того требует ТЗ) и константа `MIN_SCALE` в
    `src/hooks/useFitContent.ts`.
- **Георгиевская лента** — полностью инлайн-SVG в `StGeorgeRibbon.tsx`,
  масштабируется без потери качества; цвета полос — `#F5A623`/`#1A1A1A`.

## Проверено вручную

Долгое ФИО (авто-уменьшение шрифта и обрезка до 2 строк), карточка с 1 и с 5
заполненными разделами, переполнение большим объёмом текста (появляется
индикатор «Контент не помещается»), экспорт PNG (совпадает с предпросмотром,
т.к. экспортируется тот же DOM-узел без визуального CSS-масштабирования),
пустая консоль браузера без ошибок.
