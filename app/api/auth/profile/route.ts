import { and, eq, ne } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { readAuthSession } from "../../../../lib/auth/token";
import { db } from "../../../../lib/db";
import { users, type NewUser } from "../../../../lib/db/schema";
import { serializeUser } from "../../../../lib/users/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readName(value: unknown) {
  if (typeof value !== "string" || !value.trim())
    return { error: "Nama wajib diisi." };
  const name = value.trim();
  return name.length <= 120
    ? { value: name }
    : { error: "Nama maksimal 120 karakter." };
}

function readEmail(value: unknown) {
  if (typeof value !== "string" || !value.trim())
    return { error: "Email wajib diisi." };
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email))
    return { error: "Email harus berupa alamat yang valid." };
  return { value: email };
}

function readWhatsApp(value: unknown) {
  if (value === null) return { value: null as string | null };
  if (typeof value !== "string")
    return { error: "Nomor WhatsApp harus berupa teks atau null." };
  const whatsapp = value.trim();
  return whatsapp.length <= 40
    ? { value: whatsapp || null }
    : { error: "Nomor WhatsApp maksimal 40 karakter." };
}

function getAuthenticated(request: NextRequest) {
  const authenticated = readAuthSession(request);
  if (!authenticated)
    return {
      response: NextResponse.json(
        { error: "Sesi autentikasi diperlukan." },
        { status: 401 },
      ),
    };
  if (authenticated.user.status === "blocked")
    return {
      response: NextResponse.json(
        { error: "Akun pengguna sedang diblokir." },
        { status: 403 },
      ),
    };
  return authenticated;
}

export function GET(request: NextRequest) {
  const authenticated = getAuthenticated(request);
  if ("response" in authenticated) return authenticated.response;
  return NextResponse.json({ data: serializeUser(authenticated.user) });
}

export async function PATCH(request: NextRequest) {
  const authenticated = getAuthenticated(request);
  if ("response" in authenticated) return authenticated.response;

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

  const name =
    "name" in body
      ? readName(body.name)
      : { value: undefined as string | undefined };
  const email =
    "email" in body
      ? readEmail(body.email)
      : { value: undefined as string | undefined };
  const whatsappValue = "whatsapp" in body ? body.whatsapp : body.phone;
  const whatsapp =
    "whatsapp" in body || "phone" in body
      ? readWhatsApp(whatsappValue)
      : { value: undefined as string | null | undefined };
  const fieldErrors = [name, email, whatsapp]
    .map((field) => ("error" in field ? field.error : undefined))
    .filter((error): error is string => Boolean(error));
  if (fieldErrors.length)
    return NextResponse.json({ error: fieldErrors[0] }, { status: 400 });

  const updates: Partial<NewUser> = { updatedAt: new Date() };
  if (name.value !== undefined) updates.name = name.value;
  if (email.value !== undefined) updates.email = email.value;
  if (whatsapp.value !== undefined) updates.whatsapp = whatsapp.value;
  if (Object.keys(updates).length === 1)
    return NextResponse.json(
      { error: "Kirim minimal satu field untuk diperbarui." },
      { status: 400 },
    );

  try {
    if (email.value) {
      const existing = db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.email, email.value),
            ne(users.id, authenticated.user.id),
          ),
        )
        .get();
      if (existing)
        return NextResponse.json(
          { error: "Email sudah digunakan akun lain." },
          { status: 409 },
        );
    }
    const updated = db
      .update(users)
      .set(updates)
      .where(eq(users.id, authenticated.user.id))
      .returning()
      .get();
    return updated
      ? NextResponse.json({
          data: serializeUser(updated),
          message: "Profil berhasil diperbarui.",
        })
      : NextResponse.json(
          { error: "Pengguna tidak ditemukan." },
          { status: 404 },
        );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unique")
    )
      return NextResponse.json(
        { error: "Email sudah digunakan akun lain." },
        { status: 409 },
      );
    console.error("Failed to update user profile", error);
    return NextResponse.json(
      { error: "Profil belum bisa diperbarui." },
      { status: 500 },
    );
  }
}
