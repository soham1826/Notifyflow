/**
 * Interpolates variables inside a template string.
 * Replaces {{variable}} or {{ variable }} placeholders with values from the data record.
 * Falls back to an empty string if a key is not found.
 */
export function interpolate(
  templateText: string,
  data: Record<string, string | number | boolean>
): string {
  return templateText.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = data[key];
    return value !== undefined ? String(value) : "";
  });
}
