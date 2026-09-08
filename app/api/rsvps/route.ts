import { and, asc, desc, eq, like, or, type SQL } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import {
  guests,
  invitations,
  notifications,
  rsvpStatuses,
  rsvps,
  type Guest,
  type NewRSVP,
} from "../../../lib/db/schema";
import { parseRsvpOptions, type RsvpOptions } from "../../../lib/rsvps/options";
import { rsvpStatusLabels, serializeRSVP } from "../../../lib/rsvps/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FieldResult<T> = { value?: T; error?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredText(value: unknown, fieldName: string): FieldResult<string> {
  if (typeof value !== "string" || !value.trim()) {
    return { error: `${fieldName} harus berupa teks yang tidak kosong.` };
  }
  return { value: value.trim() };
}

function readOptionalText(value: unknown, fieldName: string): FieldResult<string | null> {
  if (value === undefined || value === null) return { value: null };
  if (typeof value !== "string") return { error: `${fieldName} harus berupa teks atau null.` };
  return { value: value.trim() || null };
}

function readStatus(value: unknown): FieldResult<(typeof rsvpStatuses)[number]> {
  if (typeof value !== "string" || !value.trim()) {
    return { error: "status wajib diisi dengan attending, declined, atau maybe." };
  }

  const normalized = value.trim().toLowerCase();
  const aliases: Record<string, (typeof rsvpStatuses)[number]> = {
    attending: "attending",
    hadir: "attending",
    declined: "declined",
    "tidak hadir": "declined",
    maybe: "maybe",
    ragu: "maybe",
    "masih ragu": "maybe",
  };
  const status = aliases[normalized];
  return status ? { value: status } : { error: "status harus berupa attending, declined, atau maybe." };
}

function normalizeStatus(value: string) {
  const result = readStatus(value);
  return result.value;
}

function readPartySize(value: unknown): FieldResult<number> {
  if (value === undefined || value === null || value === "") return { value: 1 };
  const partySize = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;
  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
    return { error: "partySize harus berupa bilangan bulat antara 1 dan 20." };
  }
  return { value: partySize };
}

function getDeadlineTimestamp(options: RsvpOptions) {
  if (!options.deadlineEnabled || !options.deadline) return null;
  const value = options.deadline;

  const raw = String(value).trim();
  if (!raw) return null;
  const timestamp = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T23:59:59.999Z`).getTime()
    : new Date(raw).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const invitationId = searchParams.get("invitationId")?.trim();
  const slug = (searchParams.get("slug") ?? searchParams.get("invitationSlug"))?.trim();
  const query = (searchParams.get("q") ?? searchParams.get("search"))?.trim();
  const statusParam = searchParams.get("status")?.trim();

  if (!invitationId && !slug) {
    return NextResponse.json({ error: "Kirim invitationId atau slug undangan." }, { status: 400 });
  }

  const status = statusParam ? normalizeStatus(statusParam) : undefined;
  if (statusParam && !status) {
    return NextResponse.json({ error: "status harus berupa attending, declined, atau maybe." }, { status: 400 });
  }

  try {
    const invitation = invitationId
      ? await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.id, invitationId)).get()
      : await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.slug, slug!)).get();
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const filters: SQL[] = [eq(rsvps.invitationId, invitation.id)];
    if (query) {
      const pattern = `%${query}%`;
      filters.push(or(like(rsvps.name, pattern), like(rsvps.phone, pattern), like(rsvps.message, pattern))!);
    }
    if (status) filters.push(eq(rsvps.status, status));

    const rows = await db
      .select()
      .from(rsvps)
      .where(and(...filters))
      .orderBy(desc(rsvps.respondedAt), asc(rsvps.name))
      .all();
    return NextResponse.json({ data: rows.map(serializeRSVP), count: rows.length });
  } catch (error) {
    console.error("Failed to list RSVPs", error);
    return NextResponse.json({ error: "Daftar RSVP belum bisa dimuat." }, { status: 500 });
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

  const invitationId = readOptionalText(body.invitationId, "invitationId");
  const slug = readOptionalText(body.slug ?? body.invitationSlug, "slug");
  const guestId = readOptionalText(body.guestId, "guestId");
  const name = readRequiredText(body.name, "name");
  const phone = readOptionalText(body.phone, "phone");
  const status = readStatus(body.status);
  const partySize = readPartySize(body.partySize ?? body.guestTotal);
  const message = readOptionalText(body.message ?? body.note, "message");
  const fieldErrors = [invitationId, slug, guestId, name, phone, status, partySize, message]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));

  if (fieldErrors.length) return NextResponse.json({ error: fieldErrors[0] }, { status: 400 });
  if (!invitationId.value && !slug.value) {
    return NextResponse.json({ error: "Kirim invitationId atau slug undangan." }, { status: 400 });
  }
  if (name.value!.length > 120) return NextResponse.json({ error: "name maksimal 120 karakter." }, { status: 400 });
  if (phone.value && phone.value.length > 40) return NextResponse.json({ error: "phone maksimal 40 karakter." }, { status: 400 });
  if (message.value && message.value.length > 1000) return NextResponse.json({ error: "message maksimal 1000 karakter." }, { status: 400 });

  try {
    const invitation = invitationId.value
      ? await db.select().from(invitations).where(eq(invitations.id, invitationId.value)).get()
      : await db.select().from(invitations).where(eq(invitations.slug, slug.value!)).get();
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const options = parseRsvpOptions(invitation.rsvpOptions);
    if (!options.enabled) {
      return NextResponse.json({ error: "RSVP untuk undangan ini sedang ditutup." }, { status: 409 });
    }

    const deadline = getDeadlineTimestamp(options);
    if (deadline !== null && Date.now() > deadline) {
      return NextResponse.json({ error: "Batas waktu RSVP untuk undangan ini sudah berakhir." }, { status: 409 });
    }

    if (partySize.value! > 1 && (!options.partySizeEnabled || !options.plusOneEnabled)) {
      return NextResponse.json({ error: "Undangan ini hanya menerima konfirmasi untuk satu orang." }, { status: 400 });
    }

    let linkedGuest: Guest | undefined;
    if (guestId.value) {
      linkedGuest = await db.select().from(guests).where(eq(guests.id, guestId.value)).get();
      if (!linkedGuest || linkedGuest.invitationId !== invitation.id) {
        return NextResponse.json({ error: "guestId tidak berasal dari undangan yang sama." }, { status: 400 });
      }
    } else if (phone.value) {
      linkedGuest = await db.select().from(guests).where(and(eq(guests.invitationId, invitation.id), eq(guests.phone, phone.value))).get();
    }

    const now = new Date();
    const values: NewRSVP = {
      id: randomUUID(),
      invitationId: invitation.id,
      guestId: linkedGuest?.id ?? null,
      name: name.value!,
      phone: phone.value ?? linkedGuest?.phone ?? null,
      status: status.value!,
      partySize: partySize.value!,
      message: message.value,
      respondedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.transaction(async (tx) => {
      const created = await tx.insert(rsvps).values(values).returning().get();
      await tx.insert(notifications).values({
        id: randomUUID(),
        userId: invitation.userId,
        invitationId: invitation.id,
        rsvpId: created.id,
        type: "rsvp",
        title: `RSVP baru dari ${created.name}`,
        body: `${rsvpStatusLabels[created.status]} · ${created.partySize} orang`,
        isRead: false,
        readAt: null,
        createdAt: now,
      }).run();
      return created;
    });

    return NextResponse.json({ data: serializeRSVP(result), message: "RSVP berhasil dikirim." }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit RSVP", error);
    return NextResponse.json({ error: "RSVP belum bisa disimpan." }, { status: 500 });
  }
}
