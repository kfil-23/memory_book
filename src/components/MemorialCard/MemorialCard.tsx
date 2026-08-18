import { forwardRef } from "react";
import type { MemorialPerson } from "../../types";
import { BackgroundLayer } from "./BackgroundLayer";
import { GlassPanel } from "./GlassPanel";
import { PersonName } from "./PersonName";
import { InfoSections } from "./InfoSections";
import { Portrait } from "./Portrait";
import { StGeorgeRibbon } from "./StGeorgeRibbon";
import styles from "./MemorialCard.module.css";

export const MemorialCard = forwardRef<
  HTMLDivElement,
  { person: MemorialPerson; onFitChange?: (fits: boolean) => void }
>(function MemorialCard({ person, onFitChange }, ref) {
  return (
    <div ref={ref} className={styles.card}>
      <BackgroundLayer settings={person.background} />
      <GlassPanel background={person.background}>
        <PersonName fullName={person.fullName} />
        <InfoSections sections={person.sections} onFitChange={onFitChange} />
      </GlassPanel>
      <Portrait src={person.portrait} transform={person.portraitTransform} />
      <StGeorgeRibbon />
    </div>
  );
});
