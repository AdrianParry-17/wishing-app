const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const MAX_WISH_LENGTH = 512;

function countUnicodeCharacters(value: string): number {
  return Array.from(value).length;
}

export type NormalizedWishResult =
  | { ok: true; content: string }
  | { ok: false };

export function normalizeAndValidateWish(rawContent: unknown): NormalizedWishResult {
  if (typeof rawContent !== "string") {
    return { ok: false };
  }

  const normalized = rawContent
    .replace(/\r\n/g, "\n")
    .replace(CONTROL_CHARACTERS, "")
    .trim();

  const characterCount = countUnicodeCharacters(normalized);

  if (characterCount === 0 || characterCount > MAX_WISH_LENGTH) {
    return { ok: false };
  }

  return { ok: true, content: normalized };
}

export function isHoneypotFilled(honeypotValue: unknown): boolean {
  if (honeypotValue === undefined || honeypotValue === null) {
    return false;
  }

  if (typeof honeypotValue !== "string") {
    return true;
  }

  return honeypotValue.trim().length > 0;
}