import { useLayoutEffect, useState, type RefObject } from "react";

export type Density = "normal" | "compact" | "veryCompact";

const DENSITY_STEPS: Density[] = ["normal", "compact", "veryCompact"];

/**
 * Переключает плотность контента (NORMAL → COMPACT → VERY COMPACT), пока
 * содержимое contentRef не впишется по высоте в containerRef, либо пока не
 * будет исчерпан последний режим.
 */
export function useFitDensity(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  deps: unknown[],
): { density: Density; fits: boolean } {
  const [density, setDensity] = useState<Density>("normal");
  const [fits, setFits] = useState(true);

  useLayoutEffect(() => {
    let cancelled = false;

    function measure() {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const available = container.clientHeight;
      let chosen: Density = DENSITY_STEPS[0];
      let natural = 0;

      for (const step of DENSITY_STEPS) {
        content.setAttribute("data-density", step);
        natural = content.scrollHeight;
        chosen = step;
        if (natural <= available) break;
      }

      setDensity(chosen);
      setFits(natural <= available);
    }

    measure();

    // Веб-шрифт (Montserrat) может ещё не быть загружен в момент первого
    // измерения — пересчитываем плотность после его подгрузки.
    document.fonts?.ready?.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { density, fits };
}
