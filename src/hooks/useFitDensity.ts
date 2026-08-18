import { useLayoutEffect, useState, type RefObject } from "react";

export type Density = "normal" | "compact" | "veryCompact";

const DENSITY_STEPS: Density[] = ["normal", "compact", "veryCompact"];
const MIN_FINE_SCALE = 0.35;
const FINE_STEP = 0.02;

/**
 * Переключает плотность контента (NORMAL → COMPACT → VERY COMPACT). Если
 * весь текст всё равно не помещается даже в VERY COMPACT, дальше плавно
 * уменьшает масштаб (--fine-scale) до MIN_FINE_SCALE — весь текст должен
 * поместиться, даже если для этого придётся стать очень мелким.
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

      content.style.setProperty("--fine-scale", "1");

      const available = container.clientHeight;
      let chosen: Density = DENSITY_STEPS[0];
      let natural = 0;

      for (const step of DENSITY_STEPS) {
        content.setAttribute("data-density", step);
        natural = content.scrollHeight;
        chosen = step;
        if (natural <= available) break;
      }

      let fineScale = 1;
      let iterations = 0;
      while (natural > available && fineScale > MIN_FINE_SCALE && iterations < 40) {
        fineScale = Math.max(MIN_FINE_SCALE, fineScale - FINE_STEP);
        content.style.setProperty("--fine-scale", String(fineScale));
        natural = content.scrollHeight;
        iterations += 1;
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
