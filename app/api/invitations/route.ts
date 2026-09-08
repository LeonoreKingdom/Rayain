import { randomUUID } from "node:crypto";
import { and, desc, eq, like, or, type SQL } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import {
  invitations,
  invitationStatuses,
  invitationTypes,
  type Invitation,
  type NewInvitation,
} from "../../../lib/db/schema";
import { serializeInvitation } from "../../../lib/invitations/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isInvitationStatus(value: string | null): value is (typeof invitationStatuses)[number] {
  return value !== null && invitationStatuses.includes(value as (typeof invitationStatuses)[number]);
}

function getOrigin(request: NextRequest) {
  return request.nextUrl.origin || request.headers.get("origin") || "http://localhost:3000";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54) || "undangan-baru";
}

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const query = searchParams.get("q")?.trim();

  if (status && !isInvitationStatus(status)) {
    return NextResponse.json(
      { error: "Filter status harus berupa draft atau published." },
      { status: 400 },
    );
  }

  const statusFilter = isInvitationStatus(status) ? status : undefined;

  try {
    const filters: SQL[] = [];
    if (statusFilter) filters.push(eq(invitations.status, statusFilter));
    if (query) {
      const pattern = `%${query}%`;
      const searchFilter = or(
        like(invitations.title, pattern),
        like(invitations.location, pattern),
        like(invitations.eventType, pattern),
      );
      if (searchFilter) filters.push(searchFilter);
    }

    const rows = (filters.length > 0
      ? db.select().from(invitations).where(and(...filters))
      : db.select().from(invitations)
    ).orderBy(desc(invitations.updatedAt)).all();

    return NextResponse.json({
      data: rows.map((invitation: Invitation) => serializeInvitation(invitation, getOrigin(request))),
      count: rows.length,
    });
  } catch (error) {
    console.error("Failed to list invitations", error);
    return NextResponse.json(
      { error: "Daftar undangan belum bisa dimuat. Pastikan database sudah dimigrasikan." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Body request harus berupa object JSON." }, { status: 400 });
  }

  const id = randomUUID();
  const title = readText(body.title ?? body.coupleName, "Undangan baru");
  const eventType = readText(body.eventType, "other");
  if (!invitationTypes.includes(eventType as (typeof invitationTypes)[number])) {
    return NextResponse.json(
      { error: `eventType harus salah satu dari: ${invitationTypes.join(", ")}.` },
      { status: 400 },
    );
  }

  if (title.length > 120) {
    return NextResponse.json({ error: "Judul undangan maksimal 120 karakter." }, { status: 400 });
  }

  const now = new Date();
  const values: NewInvitation = {
    id,
    slug: `${slugify(title)}-${id.slice(0, 8)}`,
    userId: typeof body.userId === "string" && body.userId.trim()
      ? body.userId.trim()
      : typeof body.ownerId === "string" && body.ownerId.trim()
        ? body.ownerId.trim()
        : null,
    templateId: typeof body.templateId === "string" && body.templateId.trim() ? body.templateId.trim() : null,
    musicId: typeof body.musicId === "string" && body.musicId.trim() ? body.musicId.trim() : null,
    title,
    eventType: eventType as (typeof invitationTypes)[number],
    eventDate: readText(body.eventDate ?? body.date, now.toISOString().slice(0, 10)),
    eventTime: readText(body.eventTime ?? body.time, "19:00"),
    location: readText(body.location, "Lokasi akan diisi"),
    message: readText(body.message, "Sampai jumpa di momen istimewa kami."),
    content: JSON.stringify({
      coupleName: title,
      message: readText(body.message, "Sampai jumpa di momen istimewa kami."),
    }),
    designData: JSON.stringify({
      color: readText(body.color, "blush"),
      font: readText(body.font, "serif"),
      photo: readText(body.photo, "none"),
      layout: readText(body.layout, "classic"),
    }),
    rsvpOptions: JSON.stringify({ enabled: true }),
    template: readText(body.template, "soft-promise"),
    color: readText(body.color, "blush"),
    font: readText(body.font, "serif"),
    photo: readText(body.photo, "none"),
    layout: readText(body.layout, "classic"),
    status: "draft",
    guestCount: 0,
  };

  try {
    const created = db.insert(invitations).values(values).returning().get();
    return NextResponse.json(
      { data: serializeInvitation(created, getOrigin(request)) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create invitation", error);
    return NextResponse.json({ error: "Undangan baru belum bisa dibuat." }, { status: 500 });
  }
}
