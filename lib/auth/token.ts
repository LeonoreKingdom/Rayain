import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db";
import { authSessions, users, type AuthSession, type User } from "../db/schema";

export const authTokenCookie = "rayain_auth_token";
export const authTokenMaxAge = 7 * 24 * 60 * 60;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer "))
    return authorization.slice("Bearer ".length).trim();
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${authTokenCookie}=`));
  return cookie
    ? decodeURIComponent(cookie.slice(authTokenCookie.length + 1))
    : null;
}

export function createAuthSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + authTokenMaxAge * 1000);
  db.insert(authSessions)
    .values({
      id: randomUUID(),
      userId,
      tokenHash: hashToken(token),
      expiresAt,
    })
    .run();
  return { token, expiresAt };
}

export function readAuthSession(
  request: Request,
): { session: AuthSession; user: User } | null {
  const token = readToken(request);
  if (!token) return null;
  const session = db
    .select()
    .from(authSessions)
    .where(
      and(
        eq(authSessions.tokenHash, hashToken(token)),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .get();
  if (!session) return null;
  const user = db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();
  return user ? { session, user } : null;
}

export function revokeAuthSession(request: Request) {
  const token = readToken(request);
  if (!token) return;
  db.update(authSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(authSessions.tokenHash, hashToken(token)),
        isNull(authSessions.revokedAt),
      ),
    )
    .run();
}

export function setAuthCookie(
  response: {
    cookies: {
      set: (
        name: string,
        value: string,
        options: Record<string, unknown>,
      ) => void;
    };
  },
  token: string,
) {
  response.cookies.set(authTokenCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authTokenMaxAge,
  });
}

export function clearAuthCookie(response: {
  cookies: {
    set: (
      name: string,
      value: string,
      options: Record<string, unknown>,
    ) => void;
  };
}) {
  response.cookies.set(authTokenCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
