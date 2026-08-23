/**
 * Уменьшает изображение до maxDimension по большей стороне и пережимает
 * в JPEG — чтобы фото с телефона (5–15 МБ) не ломало сохранение в базу
 * и не тормозило редактор.
 */
export function resizeImageToDataUrl(
  file: File,
  maxDimension: number,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      if (!img.width || !img.height) {
        reject(new Error("Не удалось определить размер изображения — попробуйте другой файл"));
        return;
      }

      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas недоступен"));
        return;
      }

      try {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (!dataUrl || dataUrl === "data:," || dataUrl.length < 100) {
          reject(
            new Error(
              "Не удалось обработать изображение (слишком большое разрешение) — попробуйте уменьшить фото перед загрузкой",
            ),
          );
          return;
        }
        resolve(dataUrl);
      } catch {
        reject(
          new Error(
            "Не удалось обработать изображение (слишком большое разрешение) — попробуйте уменьшить фото перед загрузкой",
          ),
        );
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Не удалось прочитать изображение"));
    };

    img.src = objectUrl;
  });
}
