import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { hashPassword } from "../../../../lib/auth/password";
import { db } from "../../../../lib/db";
import { users, type NewUser } from "../../../../lib/db/schema";
import { serializeUser } from "../../../../lib/users/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim())
    return { error: `${label} wajib diisi.` };
  const text = value.trim();
  if (text.length > maxLength)
    return { error: `${label} maksimal ${maxLength} karakter.` };
  return { value: text };
}

function readEmail(value: unknown) {
  const result = readText(value, "Email", 254);
  if ("error" in result) return result;
  const email = result.value.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Email harus berupa alamat yang valid." };
  return { value: email };
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

  const name = readText(body.name ?? body.fullName, "Nama", 120);
  const email = readEmail(body.email);
  const password = readText(body.password, "Kata sandi", 128);
  const confirmationValue =
    body.passwordConfirmation ?? body.confirmPassword ?? body.confirmation;
  const confirmation = readText(
    confirmationValue,
    "Konfirmasi kata sandi",
    128,
  );
  if ("error" in name)
    return NextResponse.json({ error: name.error }, { status: 400 });
  if ("error" in email)
    return NextResponse.json({ error: email.error }, { status: 400 });
  if ("error" in password)
    return NextResponse.json({ error: password.error }, { status: 400 });
  if (password.value.length < 8)
    return NextResponse.json(
      { error: "Kata sandi minimal 8 karakter." },
      { status: 400 },
    );
  if ("error" in confirmation)
    return NextResponse.json({ error: confirmation.error }, { status: 400 });
  if (password.value !== confirmation.value)
    return NextResponse.json(
      { error: "Konfirmasi kata sandi tidak cocok." },
      { status: 400 },
    );

  const values: NewUser = {
    id: randomUUID(),
    name: name.value,
    email: email.value,
    passwordHash: hashPassword(password.value),
    role: "owner",
    status: "active",
  };

  try {
    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, values.email))
      .get();
    if (existing)
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 },
      );
    const created = db.insert(users).values(values).returning().get();
    return NextResponse.json(
      { data: serializeUser(created), message: "Akun berhasil dibuat." },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unique")
    ) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 },
      );
    }
    console.error("Failed to register user", error);
    return NextResponse.json(
      { error: "Akun belum bisa dibuat." },
      { status: 500 },
    );
  }
}
