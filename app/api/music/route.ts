import { and, asc, eq, like, or, type SQL } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { music, type Music } from "../../../lib/db/schema";
import { serializeMusic } from "../../../lib/music/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const activeParam = searchParams.get("active");
  const query = searchParams.get("q") ?? searchParams.get("search");
  const mood = searchParams.get("mood");

  if (activeParam && activeParam !== "true" && activeParam !== "false") {
    return NextResponse.json({ error: "active harus berupa true atau false." }, { status: 400 });
  }

  try {
    const filters: SQL[] = [eq(music.isActive, activeParam !== "false")];
    const normalizedQuery = query?.trim();
    const normalizedMood = mood?.trim();

    if (normalizedQuery) {
      const pattern = `%${normalizedQuery}%`;
      filters.push(or(like(music.title, pattern), like(music.artist, pattern), like(music.mood, pattern))!);
    }
    if (normalizedMood) filters.push(like(music.mood, `%${normalizedMood}%`));

    const rows = db
      .select()
      .from(music)
      .where(and(...filters))
      .orderBy(asc(music.title))
      .all();

    return NextResponse.json({
      data: rows.map((track: Music) => serializeMusic(track)),
      count: rows.length,
    });
  } catch (error) {
    console.error("Failed to list music", error);
    return NextResponse.json(
      { error: "Pustaka musik belum bisa dimuat. Pastikan database sudah dimigrasikan." },
      { status: 500 },
    );
  }
}
