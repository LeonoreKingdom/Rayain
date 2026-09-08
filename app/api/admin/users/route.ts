import { randomUUID } from "node:crypto";
import { and, asc, count, eq, like, or, type SQL } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "../../../../lib/auth/admin";
import { db } from "../../../../lib/db";
import { userRoles, users, userStatuses, type NewUser, type User } from "../../../../lib/db/schema";
import { serializeUser } from "../../../../lib/users/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUserStatus(value: string | null): value is (typeof userStatuses)[number] {
  return value !== null && userStatuses.includes(value as (typeof userStatuses)[number]);
}

function isUserRole(value: string | null): value is (typeof userRoles)[number] {
  return value !== null && userRoles.includes(value as (typeof userRoles)[number]);
}

function readRequiredText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) return { error: `${label} wajib diisi.` };
  const text = value.trim();
  if (text.length > 120) return { error: `${label} maksimal 120 karakter.` };
  return { value: text };
}

function readEmail(value: unknown) {
  const result = readRequiredText(value, "Email");
  if ("error" in result) return result;
  const email = result.value.toLowerCase();
  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) return { error: "Email harus berupa alamat yang valid." };
  return { value: email };
}

export async function GET(request: NextRequest) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const role = searchParams.get("role");
  if (status && !isUserStatus(status)) return NextResponse.json({ error: "Filter status harus active, blocked, atau invited." }, { status: 400 });
  if (role && !isUserRole(role)) return NextResponse.json({ error: "Filter role harus owner, editor, atau admin." }, { status: 400 });
  const statusFilter = status && isUserStatus(status) ? status : null;
  const roleFilter = role && isUserRole(role) ? role : null;

  try {
    const filters: SQL[] = [];
    if (statusFilter) filters.push(eq(users.status, statusFilter));
    if (roleFilter) filters.push(eq(users.role, roleFilter));
    if (query) {
      const pattern = `%${query}%`;
      filters.push(or(like(users.name, pattern), like(users.email, pattern))!);
    }
    const queryBuilder = db.select().from(users);
    const rows = await (filters.length ? queryBuilder.where(and(...filters)) : queryBuilder).orderBy(asc(users.name)).all();
    return NextResponse.json({ data: rows.map((user: User) => serializeUser(user)), count: rows.length });
  } catch (error) {
    console.error("Failed to list admin users", error);
    return NextResponse.json({ error: "Daftar pengguna admin belum bisa dimuat." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Body request harus berupa object JSON." }, { status: 400 });

  const name = readRequiredText(body.name, "Nama");
  const email = readEmail(body.email);
  if ("error" in name) return NextResponse.json({ error: name.error }, { status: 400 });
  if ("error" in email) return NextResponse.json({ error: email.error }, { status: 400 });
  const role = typeof body.role === "string" && body.role.trim() ? body.role.trim() : "owner";
  const status = typeof body.status === "string" && body.status.trim() ? body.status.trim() : "invited";
  if (!isUserRole(role)) return NextResponse.json({ error: "role harus owner, editor, atau admin." }, { status: 400 });
  if (!isUserStatus(status)) return NextResponse.json({ error: "status harus active, blocked, atau invited." }, { status: 400 });

  const values: NewUser = { id: randomUUID(), name: name.value, email: email.value, role, status };
  try {
    const created = await db.insert(users).values(values).returning().get();
    return NextResponse.json({ data: serializeUser(created), message: "Pengguna berhasil ditambahkan." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("unique")) return NextResponse.json({ error: "Email pengguna sudah terdaftar." }, { status: 409 });
    console.error("Failed to create admin user", error);
    return NextResponse.json({ error: "Pengguna baru belum bisa ditambahkan." }, { status: 500 });
  }
}
