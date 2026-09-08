import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { invitations, music } from "../../../../../lib/db/schema";
import { serializeMusic } from "../../../../../lib/music/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const invitationId = id.trim();
  if (!invitationId) return NextResponse.json({ error: "ID undangan wajib diisi." }, { status: 400 });

  try {
    const invitation = await db
      .select({ id: invitations.id, musicId: invitations.musicId, musicAutoplay: invitations.musicAutoplay })
      .from(invitations)
      .where(eq(invitations.id, invitationId))
      .get();
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const track = invitation.musicId
      ? await db
        .select()
        .from(music)
        .where(and(eq(music.id, invitation.musicId), eq(music.isActive, true)))
        .get()
      : undefined;

    return NextResponse.json({
      data: {
        invitationId: invitation.id,
        musicId: invitation.musicId,
        musicAutoplay: invitation.musicAutoplay,
        mode: invitation.musicAutoplay ? "autoplay" : "manual",
        track: track ? serializeMusic(track) : null,
      },
    });
  } catch (error) {
    console.error("Failed to read invitation music settings", error);
    return NextResponse.json(
      { error: "Pengaturan musik undangan belum bisa dimuat." },
      { status: 500 },
    );
  }
}
