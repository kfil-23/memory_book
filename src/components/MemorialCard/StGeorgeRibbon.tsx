import styles from "./StGeorgeRibbon.module.css";

/**
 * Георгиевская лента — готовое PNG-изображение с прозрачным фоном
 * (непрозрачные чёткие оранжевые/чёрные полосы, без fade), проходит по
 * нижнему правому краю карточки поверх остальных элементов.
 */
export function StGeorgeRibbon() {
  return (
    <img
      className={styles.ribbon}
      src={`${import.meta.env.BASE_URL}st-george-ribbon.png`}
      alt=""
      aria-hidden="true"
    />
  );
}
