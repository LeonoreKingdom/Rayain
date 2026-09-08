import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { invitations, type Invitation } from "../../../../../lib/db/schema";
import { serializeInvitation } from "../../../../../lib/invitations/serialize";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getOrigin(request: NextRequest) {
  return request.nextUrl.origin || request.headers.get("origin") || "http://localhost:3000";
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const invitationId = id.trim();
  if (!invitationId) return NextResponse.json({ error: "ID undangan wajib diisi." }, { status: 400 });

  try {
    const current = db.select().from(invitations).where(eq(invitations.id, invitationId)).get();
    if (!current) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const updated = db
      .update(invitations)
      .set({ status: "published", publishedAt: current.publishedAt ?? new Date(), updatedAt: new Date() })
      .where(eq(invitations.id, invitationId))
      .returning()
      .get();

    if (!updated) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    return NextResponse.json({
      data: serializeInvitation(updated as Invitation, getOrigin(request)),
      message: "Undangan berhasil diterbitkan dan siap dibagikan.",
    });
  } catch (error) {
    console.error("Failed to publish invitation", error);
    return NextResponse.json({ error: "Undangan belum bisa diterbitkan." }, { status: 500 });
  }
}
