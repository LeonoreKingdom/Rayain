import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "../../../../lib/auth/reset";
import { db } from "../../../../lib/db";
import { users } from "../../../../lib/db/schema";

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
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return NextResponse.json(
      { error: "Email harus berupa alamat yang valid." },
      { status: 400 },
    );

  const user = db
    .select({ id: users.id, status: users.status })
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (user?.status === "active") {
    createPasswordResetToken(user.id);
  }

  return NextResponse.json({
    data: { accepted: true },
    message: "Jika email terdaftar, tautan reset kata sandi akan dikirim.",
  });
}
