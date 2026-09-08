import { and, eq, gt, isNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { hashPassword } from "../../../../lib/auth/password";
import { readValidPasswordResetToken } from "../../../../lib/auth/reset";
import { db } from "../../../../lib/db";
import { authSessions, resetTokens, users } from "../../../../lib/db/schema";
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

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmationValue =
    body.passwordConfirmation ?? body.confirmPassword ?? body.confirmation;
  const confirmation =
    typeof confirmationValue === "string" ? confirmationValue : "";
  if (!token)
    return NextResponse.json(
      { error: "Token reset wajib diisi." },
      { status: 400 },
    );
  if (!password)
    return NextResponse.json(
      { error: "Kata sandi baru wajib diisi." },
      { status: 400 },
    );
  if (password.length < 8)
    return NextResponse.json(
      { error: "Kata sandi minimal 8 karakter." },
      { status: 400 },
    );
  if (password.length > 128)
    return NextResponse.json(
      { error: "Kata sandi tidak valid." },
      { status: 400 },
    );
  if (password !== confirmation)
    return NextResponse.json(
      { error: "Konfirmasi kata sandi tidak cocok." },
      { status: 400 },
    );

  const resetToken = readValidPasswordResetToken(token);
  if (!resetToken)
    return NextResponse.json(
      { error: "Token reset tidak valid atau sudah kedaluwarsa." },
      { status: 400 },
    );
  const user = db
    .select()
    .from(users)
    .where(eq(users.id, resetToken.userId))
    .get();
  if (!user || user.status !== "active")
    return NextResponse.json(
      { error: "Token reset tidak valid atau sudah kedaluwarsa." },
      { status: 400 },
    );

  const now = new Date();
  const passwordHash = hashPassword(password);
  try {
    const updated = db.transaction((tx) => {
      const claimed = tx
        .update(resetTokens)
        .set({ usedAt: now })
        .where(
          and(
            eq(resetTokens.id, resetToken.id),
            isNull(resetTokens.usedAt),
            gt(resetTokens.expiresAt, now),
          ),
        )
        .returning({ id: resetTokens.id })
        .get();
      if (!claimed) return null;
      const updatedUser = tx
        .update(users)
        .set({ passwordHash, updatedAt: now })
        .where(eq(users.id, user.id))
        .returning()
        .get();
      if (!updatedUser)
        throw new Error("User for password reset no longer exists");
      tx.update(authSessions)
        .set({ revokedAt: now })
        .where(
          and(eq(authSessions.userId, user.id), isNull(authSessions.revokedAt)),
        )
        .run();
      return updatedUser;
    });
    if (!updated)
      return NextResponse.json(
        { error: "Token reset tidak valid atau sudah kedaluwarsa." },
        { status: 400 },
      );
    return NextResponse.json({
      data: serializeUser(updated),
      message: "Kata sandi berhasil diubah.",
    });
  } catch (error) {
    console.error("Failed to reset password", error);
    return NextResponse.json(
      { error: "Kata sandi belum bisa diubah." },
      { status: 500 },
    );
  }
}
