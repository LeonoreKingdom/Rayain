import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "../../../../../lib/auth/admin";
import { db } from "../../../../../lib/db";
import { userRoles, users, userStatuses, type NewUser, type User } from "../../../../../lib/db/schema";
import { serializeUser } from "../../../../../lib/users/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) return { error: `${label} wajib diisi.` };
  const text = value.trim();
  if (text.length > 120) return { error: `${label} maksimal 120 karakter.` };
  return { value: text };
}

function readEmail(value: unknown) {
  const result = readText(value, "Email");
  if ("error" in result) return result;
  const email = result.value.toLowerCase();
  return email.includes("@") && !email.startsWith("@") && !email.endsWith("@") ? { value: email } : { error: "Email harus berupa alamat yang valid." };
}

async function findUser(id: string) {
  return await db.select().from(users).where(eq(users.id, id)).get() as User | undefined;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;
  const id = (await params).id.trim();
  if (!id) return NextResponse.json({ error: "ID pengguna wajib diisi." }, { status: 400 });
  try {
    const user = await findUser(id);
    return user ? NextResponse.json({ data: serializeUser(user) }) : NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  } catch (error) {
    console.error("Failed to read admin user", error);
    return NextResponse.json({ error: "Detail pengguna belum bisa dimuat." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;
  const id = (await params).id.trim();
  if (!id) return NextResponse.json({ error: "ID pengguna wajib diisi." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Body request harus berupa object JSON." }, { status: 400 });

  const updates: Partial<NewUser> = { updatedAt: new Date() };
  if ("name" in body) {
    const name = readText(body.name, "Nama");
    if ("error" in name) return NextResponse.json({ error: name.error }, { status: 400 });
    updates.name = name.value;
  }
  if ("email" in body) {
    const email = readEmail(body.email);
    if ("error" in email) return NextResponse.json({ error: email.error }, { status: 400 });
    updates.email = email.value;
  }
  if ("role" in body) {
    if (typeof body.role !== "string" || !userRoles.includes(body.role as (typeof userRoles)[number])) return NextResponse.json({ error: "role harus owner, editor, atau admin." }, { status: 400 });
    updates.role = body.role as (typeof userRoles)[number];
  }
  if ("status" in body) {
    if (typeof body.status !== "string" || !userStatuses.includes(body.status as (typeof userStatuses)[number])) return NextResponse.json({ error: "status harus active, blocked, atau invited." }, { status: 400 });
    if (body.status === "blocked" && authorization.session.userId === id) return NextResponse.json({ error: "Admin aktif tidak dapat memblokir akunnya sendiri." }, { status: 400 });
    updates.status = body.status as (typeof userStatuses)[number];
  }
  if (Object.keys(updates).length === 1) return NextResponse.json({ error: "Kirim minimal satu field name, email, role, atau status." }, { status: 400 });

  try {
    const updated = await db.update(users).set(updates).where(eq(users.id, id)).returning().get();
    return updated ? NextResponse.json({ data: serializeUser(updated), message: "Pengguna berhasil diperbarui." }) : NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) return NextResponse.json({ error: "Email pengguna sudah terdaftar." }, { status: 409 });
    console.error("Failed to update admin user", error);
    return NextResponse.json({ error: "Pengguna belum bisa diperbarui." }, { status: 500 });
  }
}
