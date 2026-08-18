import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * Подбирает font-size элемента так, чтобы его содержимое вписалось в одну
 * строку по ширине containerRef, уменьшая размер от maxPx до minPx.
 */
export function useFitFontSize(
  elementRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  options: { maxPx: number; minPx: number; stepPx: number },
  deps: unknown[],
): number {
  const [fontSize, setFontSize] = useState(options.maxPx);

  useLayoutEffect(() => {
    let cancelled = false;

    function measure() {
      const el = elementRef.current;
      const container = containerRef.current;
      if (!el || !container) return;

      let current = options.maxPx;
      el.style.fontSize = `${current}px`;

      let iterations = 0;
      while (
        el.scrollWidth > container.clientWidth &&
        current > options.minPx &&
        iterations < 60
      ) {
        current = Math.max(options.minPx, current - options.stepPx);
        el.style.fontSize = `${current}px`;
        iterations += 1;
      }

      setFontSize(current);
    }

    measure();

    // Веб-шрифт (Montserrat) может ещё не быть загружен в момент первого
    // измерения — тогда ширина текста замеряется по fallback-шрифту.
    // Пересчитываем после его подгрузки, чтобы не оставить обрезанный текст.
    document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return fontSize;
}
