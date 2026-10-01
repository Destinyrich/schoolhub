import jwt from "jsonwebtoken";

const SECRET = process.env.ACCESS_TOKEN_SECRET || "dev-secret-change-me";
export const ACCESS_COOKIE_NAME = "th_access";

export type AccessPayload = {
  email: string;
  bookIds: string[];
};

// Merge newly purchased book ids into an existing (or empty) access token.
export function issueAccessToken(existing: AccessPayload | null, email: string, newBookId: string): string {
  const bookIds = new Set(existing?.bookIds ?? []);
  bookIds.add(newBookId);
  const payload: AccessPayload = { email, bookIds: Array.from(bookIds) };
  return jwt.sign(payload, SECRET, { expiresIn: "180d" });
}

export function verifyAccessToken(token: string | undefined | null): AccessPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as AccessPayload;
  } catch {
    return null;
  }
}

export function hasAccess(payload: AccessPayload | null, bookId: string): boolean {
  return !!payload?.bookIds?.includes(bookId);
}
