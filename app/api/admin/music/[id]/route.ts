import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "../../../../../lib/auth/admin";
import { db } from "../../../../../lib/db";
import { music, type Music, type NewMusic } from "../../../../../lib/db/schema";
import { serializeMusic } from "../../../../../lib/music/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readTextField(
  body: Record<string, unknown>,
  key: string,
  maxLength = 120,
) {
  if (!(key in body)) return { value: undefined as string | undefined };
  if (typeof body[key] !== "string" || !body[key].trim())
    return { error: `${key} harus berupa teks yang tidak kosong.` };
  const value = body[key].trim();
  if (value.length > maxLength)
    return { error: `${key} maksimal ${maxLength} karakter.` };
  return { value };
}

function readNullableTextField(
  body: Record<string, unknown>,
  keys: string[],
  maxLength: number,
) {
  const key = keys.find((candidate) => candidate in body);
  if (!key) return { value: undefined as string | null | undefined };
  if (body[key] === null) return { value: null as string | null };
  if (typeof body[key] !== "string")
    return { error: `${key} harus berupa teks atau null.` };
  const value = body[key].trim();
  if (value.length > maxLength)
    return { error: `${key} maksimal ${maxLength} karakter.` };
  return { value: value || null };
}

function readBooleanField(body: Record<string, unknown>) {
  const key = ["isActive", "active"].find((candidate) => candidate in body);
  if (!key) return { value: undefined as boolean | undefined };
  if (typeof body[key] !== "boolean")
    return { error: `${key} harus berupa boolean.` };
  return { value: body[key] };
}

async function readTrack(params: RouteContext) {
  const { id } = await params.params;
  const trackId = id.trim();
  return {
    trackId,
    track: trackId
      ? db.select().from(music).where(eq(music.id, trackId)).get()
      : undefined,
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;
  const { trackId, track } = await readTrack({ params });
  if (!trackId)
    return NextResponse.json(
      { error: "ID musik wajib diisi." },
      { status: 400 },
    );
  if (!track)
    return NextResponse.json(
      { error: "Musik tidak ditemukan." },
      { status: 404 },
    );
  return NextResponse.json({ data: serializeMusic(track) });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;
  const { trackId, track } = await readTrack({ params });
  if (!trackId)
    return NextResponse.json(
      { error: "ID musik wajib diisi." },
      { status: 400 },
    );
  if (!track)
    return NextResponse.json(
      { error: "Musik tidak ditemukan." },
      { status: 404 },
    );

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

  const title = readTextField(body, "title");
  const artist = readTextField(body, "artist");
  const mood = readTextField(body, "mood", 80);
  const duration = readTextField(body, "duration", 20);
  const audioUrl = readNullableTextField(body, ["audioUrl", "audio_url"], 1000);
  const previewUrl = readNullableTextField(
    body,
    ["previewUrl", "preview_url"],
    1000,
  );
  const isActive = readBooleanField(body);
  const fieldErrors = [
    title,
    artist,
    mood,
    duration,
    audioUrl,
    previewUrl,
    isActive,
  ]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));
  if (fieldErrors.length)
    return NextResponse.json({ error: fieldErrors[0] }, { status: 400 });
  if (Object.keys(body).length === 0)
    return NextResponse.json(
      { error: "Kirim minimal satu field untuk diperbarui." },
      { status: 400 },
    );

  const updates: Partial<NewMusic> = { updatedAt: new Date() };
  if (title.value !== undefined) updates.title = title.value;
  if (artist.value !== undefined) updates.artist = artist.value;
  if (mood.value !== undefined) updates.mood = mood.value;
  if (duration.value !== undefined) updates.duration = duration.value;
  if (audioUrl.value !== undefined) updates.audioUrl = audioUrl.value;
  if (previewUrl.value !== undefined) updates.previewUrl = previewUrl.value;
  if (isActive.value !== undefined) updates.isActive = isActive.value;
  if (Object.keys(updates).length === 1)
    return NextResponse.json(
      { error: "Kirim minimal satu field untuk diperbarui." },
      { status: 400 },
    );

  try {
    const updated = db
      .update(music)
      .set(updates)
      .where(eq(music.id, trackId))
      .returning()
      .get();
    return updated
      ? NextResponse.json({
          data: serializeMusic(updated as Music),
          message: "Musik berhasil diperbarui.",
        })
      : NextResponse.json({ error: "Musik tidak ditemukan." }, { status: 404 });
  } catch (error) {
    console.error("Failed to update admin music", error);
    return NextResponse.json(
      { error: "Musik belum bisa diperbarui." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;
  const { trackId } = await readTrack({ params });
  if (!trackId)
    return NextResponse.json(
      { error: "ID musik wajib diisi." },
      { status: 400 },
    );

  try {
    const deleted = db
      .delete(music)
      .where(eq(music.id, trackId))
      .returning({ id: music.id })
      .get();
    return deleted
      ? NextResponse.json({ data: deleted, message: "Musik berhasil dihapus." })
      : NextResponse.json({ error: "Musik tidak ditemukan." }, { status: 404 });
  } catch (error) {
    console.error("Failed to delete admin music", error);
    return NextResponse.json(
      { error: "Musik belum bisa dihapus." },
      { status: 500 },
    );
  }
}
