
/**
 * Trunca um texto para maxLength com reticências, se necessário
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}
