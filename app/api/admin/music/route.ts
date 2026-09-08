import { randomUUID } from "node:crypto";
import { and, asc, eq, like, or, type SQL } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "../../../../lib/auth/admin";
import { db } from "../../../../lib/db";
import { music, type Music, type NewMusic } from "../../../../lib/db/schema";
import { serializeMusic } from "../../../../lib/music/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredText(value: unknown, label: string, maxLength = 120) {
  if (typeof value !== "string" || !value.trim())
    return { error: `${label} wajib diisi.` };
  const text = value.trim();
  if (text.length > maxLength)
    return { error: `${label} maksimal ${maxLength} karakter.` };
  return { value: text };
}

function readOptionalText(
  value: unknown,
  label: string,
  maxLength: number,
  fallback?: string,
) {
  if (value === undefined) return { value: fallback };
  if (value === null) return { value: null as string | null };
  if (typeof value !== "string")
    return { error: `${label} harus berupa teks atau null.` };
  const text = value.trim();
  if (text.length > maxLength)
    return { error: `${label} maksimal ${maxLength} karakter.` };
  return { value: text || null };
}

function readBoolean(value: unknown, label: string, fallback: boolean) {
  if (value === undefined) return { value: fallback };
  if (typeof value !== "boolean")
    return { error: `${label} harus berupa boolean.` };
  return { value };
}

function readActiveParam(value: string | null) {
  if (!value || value === "all")
    return { value: undefined as boolean | undefined };
  if (value === "true") return { value: true };
  if (value === "false") return { value: false };
  return { error: "active harus berupa true, false, atau all." };
}

export function GET(request: NextRequest) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  const searchParams = request.nextUrl.searchParams;
  const query = (searchParams.get("q") ?? searchParams.get("search"))?.trim();
  const mood = searchParams.get("mood")?.trim();
  const active = readActiveParam(
    searchParams.get("active") ?? searchParams.get("isActive"),
  );
  if ("error" in active)
    return NextResponse.json({ error: active.error }, { status: 400 });

  try {
    const filters: SQL[] = [];
    if (active.value !== undefined)
      filters.push(eq(music.isActive, active.value));
    if (query) {
      const pattern = `%${query}%`;
      filters.push(
        or(
          like(music.title, pattern),
          like(music.artist, pattern),
          like(music.mood, pattern),
          like(music.id, pattern),
        )!,
      );
    }
    if (mood) filters.push(like(music.mood, `%${mood}%`));
    const queryBuilder = db.select().from(music);
    const rows = (
      filters.length ? queryBuilder.where(and(...filters)) : queryBuilder
    )
      .orderBy(asc(music.title))
      .all();
    return NextResponse.json({
      data: rows.map((track: Music) => serializeMusic(track)),
      count: rows.length,
    });
  } catch (error) {
    console.error("Failed to list admin music", error);
    return NextResponse.json(
      { error: "Daftar musik admin belum bisa dimuat." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

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

  const title = readRequiredText(body.title, "Judul musik");
  const artist = readRequiredText(body.artist, "Artis");
  const mood = readOptionalText(body.mood, "Mood", 80, "Romantic & warm");
  const duration = readOptionalText(body.duration, "Durasi", 20, "00:00");
  const audioUrl = readOptionalText(
    body.audioUrl ?? body.audio_url,
    "audioUrl",
    1000,
  );
  const previewUrl = readOptionalText(
    body.previewUrl ?? body.preview_url,
    "previewUrl",
    1000,
  );
  const isActive = readBoolean(body.isActive ?? body.active, "isActive", true);
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

  const values: NewMusic = {
    id: randomUUID(),
    title: title.value!,
    artist: artist.value!,
    mood: mood.value ?? "Romantic & warm",
    duration: duration.value ?? "00:00",
    audioUrl: audioUrl.value ?? null,
    previewUrl: previewUrl.value ?? null,
    isActive: isActive.value,
  };
  try {
    const created = db.insert(music).values(values).returning().get();
    return NextResponse.json(
      { data: serializeMusic(created), message: "Musik berhasil ditambahkan." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create admin music", error);
    return NextResponse.json(
      { error: "Musik baru belum bisa ditambahkan." },
      { status: 500 },
    );
  }
}
