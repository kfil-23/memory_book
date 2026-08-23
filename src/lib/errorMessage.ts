export function getErrorMessage(error: unknown): string {
  const raw = extractRawMessage(error);
  if (/failed to fetch/i.test(raw)) {
    return "Не удалось соединиться с сервером — проверьте интернет-соединение и попробуйте ещё раз.";
  }
  return raw;
}

function extractRawMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}
