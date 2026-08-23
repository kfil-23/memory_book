export const EXPORT_WIDTH = 3344;
export const EXPORT_HEIGHT = 1790;

export function sanitizeFileName(fullName: string): string {
  const trimmed = fullName.trim() || "Карточка";
  return trimmed.replace(/\s+/g, "_").replace(/["'«»]/g, "");
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
