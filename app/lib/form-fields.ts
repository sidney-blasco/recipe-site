// Splits a pasted textarea into one trimmed entry per non-empty line.
export function splitLines(formData: FormData, fieldName: string): string[] {
  return String(formData.get(fieldName) ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function textOrNull(formData: FormData, fieldName: string): string | null {
  const value = String(formData.get(fieldName) ?? "").trim();
  return value || null;
}
