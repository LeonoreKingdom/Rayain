import { count, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { guests, invitations, rsvps } from "../../../../lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getInvitation(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const invitationId = searchParams.get("invitationId")?.trim();
  const slug = (searchParams.get("slug") ?? searchParams.get("invitationSlug"))?.trim();
  if (!invitationId && !slug) return { error: "Kirim invitationId atau slug undangan." };

  const invitation = invitationId
    ? db.select({ id: invitations.id }).from(invitations).where(eq(invitations.id, invitationId)).get()
    : db.select({ id: invitations.id }).from(invitations).where(eq(invitations.slug, slug!)).get();
  return invitation ? { invitation } : { error: "Undangan tidak ditemukan." };
}

export function GET(request: NextRequest) {
  try {
    const result = getInvitation(request);
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Undangan tidak ditemukan." ? 404 : 400 },
      );
    }

    const invitationId = result.invitation.id;
    const invitedCount = db
      .select({ count: count() })
      .from(guests)
      .where(eq(guests.invitationId, invitationId))
      .get()?.count ?? 0;
    const responses = db.select({ status: rsvps.status, partySize: rsvps.partySize }).from(rsvps).where(eq(rsvps.invitationId, invitationId)).all();

    const counts = {
      attending: { responses: 0, guests: 0 },
      declined: { responses: 0, guests: 0 },
      maybe: { responses: 0, guests: 0 },
    };
    for (const response of responses) {
      counts[response.status].responses += 1;
      counts[response.status].guests += Math.max(0, response.partySize);
    }

    const expectedAttendees = counts.attending.guests + counts.maybe.guests;
    const responseRate = invitedCount > 0
      ? Math.min(100, Math.round((responses.length / invitedCount) * 100))
      : 0;

    return NextResponse.json({
      data: {
        invitationId,
        totalGuests: invitedCount,
        totalResponses: responses.length,
        responseRate,
        confirmedAttendees: counts.attending.guests,
        expectedAttendees,
        counts,
      },
    });
  } catch (error) {
    console.error("Failed to summarize RSVPs", error);
    return NextResponse.json({ error: "Rekap RSVP belum bisa dimuat." }, { status: 500 });
  }
}
