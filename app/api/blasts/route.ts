import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { blastLogs, blasts, guests, invitations, type NewBlast, type NewBlastLog } from "../../../lib/db/schema";
import { serializeBlast } from "../../../lib/blasts/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) return { error: `${fieldName} harus berupa teks yang tidak kosong.` };
  return { value: value.trim() };
}

function parseScheduledAt(value: unknown) {
  if (value === undefined || value === null) return { value: null as Date | null };
  if (typeof value !== "string" || !value.trim()) return { error: "scheduledAt harus berupa tanggal ISO yang valid atau null." };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { error: "scheduledAt harus berupa tanggal ISO yang valid." };
  if (parsed.getTime() <= Date.now()) return { error: "scheduledAt harus berada di masa depan." };
  return { value: parsed };
}

function readGuestIds(value: unknown) {
  if (value === undefined) return { value: undefined as string[] | undefined };
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    return { error: "guestIds harus berupa array ID tamu." };
  }
  const ids = [...new Set(value.map((item) => item.trim()))];
  if (!ids.length) return { error: "guestIds tidak boleh kosong." };
  return { value: ids };
}

export async function GET(request: NextRequest) {
  const invitationId = request.nextUrl.searchParams.get("invitationId")?.trim();
  if (!invitationId) return NextResponse.json({ error: "invitationId wajib diisi." }, { status: 400 });

  try {
    const invitation = await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.id, invitationId)).get();
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    const rows = await db.select().from(blasts).where(eq(blasts.invitationId, invitationId)).orderBy(desc(blasts.createdAt)).all();
    return NextResponse.json({ data: rows.map(serializeBlast), count: rows.length });
  } catch (error) {
    console.error("Failed to list blasts", error);
    return NextResponse.json({ error: "Riwayat pengiriman belum bisa dimuat." }, { status: 500 });
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
  const message = readText(body.message, "message");
  const scheduledAt = parseScheduledAt(body.scheduledAt);
  const guestIds = readGuestIds(body.guestIds ?? body.recipientIds);
  const fieldErrors = [invitationId, message, scheduledAt, guestIds]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));
  if (fieldErrors.length) return NextResponse.json({ error: fieldErrors[0] }, { status: 400 });
  if (message.value && message.value.length > 4096) return NextResponse.json({ error: "message maksimal 4096 karakter." }, { status: 400 });

  try {
    const invitation = await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.id, invitationId.value!)).get();
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const guestFilters: SQL[] = [eq(guests.invitationId, invitationId.value!)];
    if (guestIds.value) guestFilters.push(inArray(guests.id, guestIds.value));
    const recipients = await db.select().from(guests).where(and(...guestFilters)).orderBy(asc(guests.name)).all();
    if (guestIds.value && recipients.length !== guestIds.value.length) return NextResponse.json({ error: "Semua guestIds harus berasal dari undangan yang sama." }, { status: 400 });
    if (!recipients.length) return NextResponse.json({ error: "Minimal satu tamu diperlukan untuk pengiriman." }, { status: 400 });

    const now = new Date();
    const isScheduled = scheduledAt.value !== null;
    const blastValues: NewBlast = {
      id: randomUUID(),
      invitationId: invitationId.value!,
      channel: "whatsapp",
      message: message.value!,
      status: isScheduled ? "scheduled" : "completed",
      scheduledAt: scheduledAt.value,
      startedAt: isScheduled ? null : now,
      completedAt: isScheduled ? null : now,
      totalRecipients: recipients.length,
      sentCount: isScheduled ? 0 : recipients.length,
      failedCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    const created = await db.transaction(async (tx) => {
      const blast = await tx.insert(blasts).values(blastValues).returning().get();
      const logs: NewBlastLog[] = recipients.map((guest) => ({
        id: randomUUID(),
        blastId: blast.id,
        guestId: guest.id,
        recipientName: guest.name,
        recipientPhone: guest.phone,
        status: isScheduled ? "queued" : "sent",
        errorMessage: null,
        sentAt: isScheduled ? null : now,
        createdAt: now,
      }));
      await tx.insert(blastLogs).values(logs).run();
      return blast;
    });

    return NextResponse.json({ data: serializeBlast(created), message: isScheduled ? "Pesan berhasil dijadwalkan." : "Pesan berhasil dikirim." }, { status: 201 });
  } catch (error) {
    console.error("Failed to create blast", error);
    return NextResponse.json({ error: "Pesan belum bisa dikirim atau dijadwalkan." }, { status: 500 });
  }
}
