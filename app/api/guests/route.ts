import { and, asc, eq, like, or, type SQL } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { guests, invitations, type Guest, type NewGuest } from "../../../lib/db/schema";
import { serializeGuest } from "../../../lib/guests/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) return { error: `${fieldName} harus berupa teks yang tidak kosong.` };
  return { value: value.trim() };
}

function readNullableText(value: unknown, fieldName: string) {
  if (value === null) return { value: null as string | null };
  if (typeof value !== "string") return { error: `${fieldName} harus berupa teks atau null.` };
  return { value: value.trim() || null };
}

function findInvitation(invitationId: string) {
  return db.select({ id: invitations.id }).from(invitations).where(eq(invitations.id, invitationId)).get();
}

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const invitationId = searchParams.get("invitationId")?.trim();
  const query = (searchParams.get("q") ?? searchParams.get("search"))?.trim();
  const groupName = (searchParams.get("groupName") ?? searchParams.get("group"))?.trim();

  if (!invitationId) return NextResponse.json({ error: "invitationId wajib diisi." }, { status: 400 });

  try {
    if (!findInvitation(invitationId)) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const filters: SQL[] = [eq(guests.invitationId, invitationId)];
    if (query) {
      const pattern = `%${query}%`;
      filters.push(or(like(guests.name, pattern), like(guests.phone, pattern))!);
    }
    if (groupName) filters.push(eq(guests.groupName, groupName));

    const rows = db.select().from(guests).where(and(...filters)).orderBy(asc(guests.name)).all();
    return NextResponse.json({ data: rows.map((guest: Guest) => serializeGuest(guest)), count: rows.length });
  } catch (error) {
    console.error("Failed to list guests", error);
    return NextResponse.json({ error: "Daftar tamu belum bisa dimuat." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Body request harus berupa object JSON." }, { status: 400 });

  const invitationId = readText(body.invitationId, "invitationId");
  const name = readText(body.name, "name");
  const phone = readText(body.phone, "phone");
  const groupName = body.groupName === undefined && body.group === undefined
    ? { value: "Lainnya" }
    : readText(body.groupName ?? body.group, "groupName");
  const notes = body.notes === undefined ? { value: null as string | null } : readNullableText(body.notes, "notes");
  const fieldErrors = [invitationId, name, phone, groupName, notes]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));
  if (fieldErrors.length) return NextResponse.json({ error: fieldErrors[0] }, { status: 400 });
  if (name.value && name.value.length > 120) return NextResponse.json({ error: "name maksimal 120 karakter." }, { status: 400 });
  if (phone.value && phone.value.length > 40) return NextResponse.json({ error: "phone maksimal 40 karakter." }, { status: 400 });

  try {
    if (!findInvitation(invitationId.value!)) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    const values: NewGuest = {
      id: randomUUID(),
      invitationId: invitationId.value!,
      name: name.value!,
      phone: phone.value!,
      groupName: groupName.value!,
      notes: notes.value!,
    };
    const created = db.insert(guests).values(values).returning().get();
    return NextResponse.json({ data: serializeGuest(created) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create guest", error);
    return NextResponse.json({ error: "Tamu belum bisa ditambahkan." }, { status: 500 });
  }
}
