import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "admin_session";
// ~400 days: the practical maximum most browsers honor for a persistent
// cookie, used here to approximate "stays logged in until I log out".
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  return timingSafeEqualStrings(signature, sign(issuedAt));
}

export function isCorrectPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const candidateHash = crypto.createHash("sha256").update(candidate).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();
  return candidateHash.length === expectedHash.length && crypto.timingSafeEqual(candidateHash, expectedHash);
}

// Only allow redirecting back into the admin area after login — never to an
// arbitrary or protocol-relative URL (open-redirect prevention).
export function sanitizeAdminRedirect(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//")) {
    return "/admin";
  }
  return next;
}
