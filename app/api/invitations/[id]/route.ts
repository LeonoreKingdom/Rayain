import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import {
  invitationStatuses,
  invitationTypes,
  invitations,
  music,
  type Invitation,
  type NewInvitation,
} from "../../../../lib/db/schema";
import { serializeInvitation } from "../../../../lib/invitations/serialize";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type JsonObjectResult = {
  value?: Record<string, unknown>;
  error?: string;
};

function readJsonObject(value: unknown, fieldName: string): JsonObjectResult {
  if (isRecord(value)) return { value };
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (isRecord(parsed)) return { value: parsed };
    } catch {
      // Return a field-level validation error below.
    }
  }
  return { error: `${fieldName} harus berupa object JSON.` };
}

function readTextField(body: Record<string, unknown>, keys: string[]) {
  const key = keys.find((candidate) => candidate in body);
  if (!key) return { value: undefined as string | undefined };
  if (typeof body[key] !== "string" || !body[key].trim()) {
    return { error: `${key} harus berupa teks yang tidak kosong.` };
  }
  return { value: body[key].trim() };
}

function readNullableTextField(body: Record<string, unknown>, key: string) {
  if (!(key in body)) return { value: undefined as string | null | undefined };
  if (body[key] === null) return { value: null };
  if (typeof body[key] !== "string" || !body[key].trim()) {
    return { error: `${key} harus berupa teks atau null.` };
  }
  return { value: body[key].trim() };
}

function readBooleanField(body: Record<string, unknown>, keys: string[]) {
  const key = keys.find((candidate) => candidate in body);
  if (!key) return { value: undefined as boolean | undefined };
  if (typeof body[key] !== "boolean") return { error: `${key} harus berupa boolean.` };
  return { value: body[key] };
}

function parseObject(value: string): Record<string, unknown> {
  const parsed = readJsonObject(value, "data");
  return parsed.value ?? {};
}

function getOrigin(request: NextRequest) {
  return request.nextUrl.origin || request.headers.get("origin") || "http://localhost:3000";
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const invitationId = id.trim();
  if (!invitationId) return NextResponse.json({ error: "ID undangan wajib diisi." }, { status: 400 });

  try {
    const invitation = db.select().from(invitations).where(eq(invitations.id, invitationId)).get();
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ data: serializeInvitation(invitation, getOrigin(request)) });
  } catch (error) {
    console.error("Failed to read invitation", error);
    return NextResponse.json({ error: "Undangan belum bisa dimuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const invitationId = id.trim();
  if (!invitationId) return NextResponse.json({ error: "ID undangan wajib diisi." }, { status: 400 });

  const current = db.select().from(invitations).where(eq(invitations.id, invitationId)).get();
  if (!current) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Body request harus berupa object JSON." }, { status: 400 });

  const title = readTextField(body, ["title", "coupleName"]);
  const eventType = readTextField(body, ["eventType"]);
  const eventDate = readTextField(body, ["eventDate", "date"]);
  const eventTime = readTextField(body, ["eventTime", "time"]);
  const location = readTextField(body, ["location"]);
  const message = readTextField(body, ["message"]);
  const template = readTextField(body, ["template"]);
  const color = readTextField(body, ["color"]);
  const font = readTextField(body, ["font"]);
  const photo = readTextField(body, ["photo"]);
  const layout = readTextField(body, ["layout"]);
  const templateId = readNullableTextField(body, "templateId");
  const musicId = readNullableTextField(body, "musicId");
  const musicAutoplay = readBooleanField(body, ["musicAutoplay", "autoplay"]);
  const fieldErrors = [title, eventType, eventDate, eventTime, location, message, template, color, font, photo, layout, templateId, musicId, musicAutoplay]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));
  if (fieldErrors.length > 0) return NextResponse.json({ error: fieldErrors[0] }, { status: 400 });

  if (title.value && title.value.length > 120) {
    return NextResponse.json({ error: "Judul undangan maksimal 120 karakter." }, { status: 400 });
  }
  if (eventType.value && !invitationTypes.includes(eventType.value as (typeof invitationTypes)[number])) {
    return NextResponse.json({ error: `eventType harus salah satu dari: ${invitationTypes.join(", ")}.` }, { status: 400 });
  }
  if (musicId.value) {
    const selectedMusic = db
      .select({ id: music.id })
      .from(music)
      .where(and(eq(music.id, musicId.value), eq(music.isActive, true)))
      .get();
    if (!selectedMusic) return NextResponse.json({ error: "musicId harus menunjuk ke musik aktif yang tersedia." }, { status: 400 });
  }

  const updates: Partial<NewInvitation> = { updatedAt: new Date() };
  if (title.value !== undefined) updates.title = title.value;
  if (eventType.value !== undefined) updates.eventType = eventType.value as (typeof invitationTypes)[number];
  if (eventDate.value !== undefined) updates.eventDate = eventDate.value;
  if (eventTime.value !== undefined) updates.eventTime = eventTime.value;
  if (location.value !== undefined) updates.location = location.value;
  if (message.value !== undefined) updates.message = message.value;
  if (template.value !== undefined) updates.template = template.value;
  if (color.value !== undefined) updates.color = color.value;
  if (font.value !== undefined) updates.font = font.value;
  if (photo.value !== undefined) updates.photo = photo.value;
  if (layout.value !== undefined) updates.layout = layout.value;
  if (templateId.value !== undefined) updates.templateId = templateId.value;
  if (musicId.value !== undefined) updates.musicId = musicId.value;
  if (musicAutoplay.value !== undefined) updates.musicAutoplay = musicAutoplay.value;

  const contentPatch = "content" in body ? readJsonObject(body.content, "content") : { value: undefined };
  const designPatch = "designData" in body ? readJsonObject(body.designData, "designData") : { value: undefined };
  const stylePatch = "style" in body ? readJsonObject(body.style, "style") : { value: undefined };
  const jsonErrors = [contentPatch, designPatch, stylePatch]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));
  if (jsonErrors.length > 0) return NextResponse.json({ error: jsonErrors[0] }, { status: 400 });

  const nextContent = { ...parseObject(current.content), ...(contentPatch.value ?? {}) };
  if (title.value !== undefined) nextContent.coupleName = title.value;
  if (message.value !== undefined) nextContent.message = message.value;
  if (contentPatch.value || title.value !== undefined || message.value !== undefined) {
    updates.content = JSON.stringify(nextContent);
  }

  const nextDesign = { ...parseObject(current.designData), ...(designPatch.value ?? {}), ...(stylePatch.value ?? {}) };
  for (const [key, field] of [["color", color], ["font", font], ["photo", photo], ["layout", layout]] as const) {
    if (field.value !== undefined) nextDesign[key] = field.value;
  }
  if (designPatch.value || stylePatch.value || color.value !== undefined || font.value !== undefined || photo.value !== undefined || layout.value !== undefined) {
    updates.designData = JSON.stringify(nextDesign);
  }

  if ("rsvpOptions" in body) {
    const rsvpOptions = readJsonObject(body.rsvpOptions, "rsvpOptions");
    if (rsvpOptions.error) return NextResponse.json({ error: rsvpOptions.error }, { status: 400 });
    updates.rsvpOptions = JSON.stringify(rsvpOptions.value);
  }

  if ("status" in body) {
    if (typeof body.status !== "string" || !invitationStatuses.includes(body.status as (typeof invitationStatuses)[number])) {
      return NextResponse.json({ error: "status harus berupa draft atau published." }, { status: 400 });
    }
    const status = body.status as (typeof invitationStatuses)[number];
    updates.status = status;
    updates.publishedAt = status === "published" ? new Date() : null;
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "Kirim minimal satu field untuk diperbarui." }, { status: 400 });
  }

  try {
    const updated = db.update(invitations).set(updates).where(eq(invitations.id, invitationId)).returning().get();
    if (!updated) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ data: serializeInvitation(updated as Invitation, request.url ? new URL(request.url).origin : "http://localhost:3000") });
  } catch (error) {
    console.error("Failed to update invitation", error);
    return NextResponse.json({ error: "Undangan belum bisa diperbarui." }, { status: 500 });
  }
}

export function DELETE(_request: Request, { params }: RouteContext) {
  return params.then(({ id }) => {
    const invitationId = id.trim();
    if (!invitationId) return Response.json({ error: "ID undangan wajib diisi." }, { status: 400 });

    try {
      const deleted = db.delete(invitations).where(eq(invitations.id, invitationId)).returning({ id: invitations.id }).get();
      if (!deleted) return Response.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
      return Response.json({ data: deleted, message: "Undangan berhasil dihapus." });
    } catch (error) {
      console.error("Failed to delete invitation", error);
      return Response.json({ error: "Undangan belum bisa dihapus." }, { status: 500 });
    }
  });
}
