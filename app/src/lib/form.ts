/** Leitura e normalização de FormData (não é um módulo de ações). */

export function str(fd: FormData, key: string): string | null {
  const value = fd.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function req(fd: FormData, key: string): string {
  return str(fd, key) ?? "";
}

export function bool(fd: FormData, key: string): boolean {
  const value = fd.get(key);
  return value === "1" || value === "on" || value === "true";
}

export function list(fd: FormData, key: string): string[] {
  return fd
    .getAll(key)
    .map((v) => String(v).trim())
    .filter(Boolean);
}

export function intOrNull(fd: FormData, key: string): number | null {
  const raw = str(fd, key);
  if (!raw) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Erro inesperado.";
}
