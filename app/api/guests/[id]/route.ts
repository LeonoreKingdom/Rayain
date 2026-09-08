import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "../../../../lib/db";
import { guests, type Guest, type NewGuest } from "../../../../lib/db/schema";
import { serializeGuest } from "../../../../lib/guests/serialize";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readTextField(body: Record<string, unknown>, keys: string[]) {
  const key = keys.find((candidate) => candidate in body);
  if (!key) return { value: undefined as string | undefined };
  if (typeof body[key] !== "string" || !body[key].trim()) return { error: `${key} harus berupa teks yang tidak kosong.` };
  return { value: body[key].trim() };
}

function readNullableTextField(body: Record<string, unknown>, key: string) {
  if (!(key in body)) return { value: undefined as string | null | undefined };
  if (body[key] === null) return { value: null as string | null };
  if (typeof body[key] !== "string") return { error: `${key} harus berupa teks atau null.` };
  return { value: body[key].trim() || null };
}

async function readGuest(params: RouteContext) {
  const { id } = await params.params;
  const guestId = id.trim();
  if (!guestId) return { guestId, guest: undefined };
  return { guestId, guest: await db.select().from(guests).where(eq(guests.id, guestId)).get() };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { guestId, guest } = await readGuest({ params });
  if (!guestId) return Response.json({ error: "ID tamu wajib diisi." }, { status: 400 });
  if (!guest) return Response.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
  return Response.json({ data: serializeGuest(guest) });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { guestId, guest } = await readGuest({ params });
  if (!guestId) return Response.json({ error: "ID tamu wajib diisi." }, { status: 400 });
  if (!guest) return Response.json({ error: "Tamu tidak ditemukan." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (!isRecord(body)) return Response.json({ error: "Body request harus berupa object JSON." }, { status: 400 });

  const name = readTextField(body, ["name"]);
  const phone = readTextField(body, ["phone"]);
  const groupName = readTextField(body, ["groupName", "group"]);
  const notes = readNullableTextField(body, "notes");
  const fieldErrors = [name, phone, groupName, notes]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));
  if (fieldErrors.length) return Response.json({ error: fieldErrors[0] }, { status: 400 });
  if (name.value && name.value.length > 120) return Response.json({ error: "name maksimal 120 karakter." }, { status: 400 });
  if (phone.value && phone.value.length > 40) return Response.json({ error: "phone maksimal 40 karakter." }, { status: 400 });

  const updates: Partial<NewGuest> = { updatedAt: new Date() };
  if (name.value !== undefined) updates.name = name.value;
  if (phone.value !== undefined) updates.phone = phone.value;
  if (groupName.value !== undefined) updates.groupName = groupName.value;
  if (notes.value !== undefined) updates.notes = notes.value;
  if (Object.keys(updates).length === 1) return Response.json({ error: "Kirim minimal satu field untuk diperbarui." }, { status: 400 });

  try {
    const updated = await db.update(guests).set(updates).where(eq(guests.id, guestId)).returning().get();
    if (!updated) return Response.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
    return Response.json({ data: serializeGuest(updated as Guest) });
  } catch (error) {
    console.error("Failed to update guest", error);
    return Response.json({ error: "Tamu belum bisa diperbarui." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { guestId } = await readGuest({ params });
  if (!guestId) return Response.json({ error: "ID tamu wajib diisi." }, { status: 400 });
  try {
    const deleted = await db.delete(guests).where(eq(guests.id, guestId)).returning({ id: guests.id }).get();
    if (!deleted) return Response.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
    return Response.json({ data: deleted, message: "Tamu berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete guest", error);
    return Response.json({ error: "Tamu belum bisa dihapus." }, { status: 500 });
  }
}
