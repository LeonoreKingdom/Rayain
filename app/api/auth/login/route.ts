import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { createAuthSession, setAuthCookie } from "../../../../lib/auth/token";
import { verifyPassword } from "../../../../lib/auth/password";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/db/schema";
import { serializeUser } from "../../../../lib/users/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 },
    );
  }
  if (!isRecord(body))
    return NextResponse.json(
      { error: "Body request harus berupa object JSON." },
      { status: 400 },
    );

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return NextResponse.json(
      { error: "Email harus berupa alamat yang valid." },
      { status: 400 },
    );
  if (!password)
    return NextResponse.json(
      { error: "Kata sandi wajib diisi." },
      { status: 400 },
    );
  if (password.length > 128)
    return NextResponse.json(
      { error: "Kata sandi tidak valid." },
      { status: 400 },
    );

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !verifyPassword(password, user.passwordHash))
    return NextResponse.json(
      { error: "Email atau kata sandi salah." },
      { status: 401 },
    );
  if (user.status === "blocked")
    return NextResponse.json(
      { error: "Akun pengguna sedang diblokir." },
      { status: 403 },
    );
  if (user.status === "invited")
    return NextResponse.json(
      { error: "Akun pengguna belum diaktifkan." },
      { status: 403 },
    );

  const now = new Date();
  await db.update(users)
    .set({ lastLoginAt: now, updatedAt: now })
    .where(eq(users.id, user.id))
    .run();
  const session = await createAuthSession(user.id);
  const response = NextResponse.json({
    data: serializeUser({ ...user, lastLoginAt: now, updatedAt: now }),
    token: session.token,
    session: { expiresAt: session.expiresAt.toISOString() },
    message: "Berhasil masuk.",
  });
  setAuthCookie(response, session.token);
  return response;
}
