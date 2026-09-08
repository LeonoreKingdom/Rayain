import { count, eq, gte } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { blasts, content, guests, invitations, music, rsvps, users } from "../../../../lib/db/schema";
import { readDemoSession } from "../../../../lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supportedPeriods = { "7d": 7, "30d": 30, "90d": 90 } as const;
type StatsPeriod = keyof typeof supportedPeriods;

function countRows(table: typeof users | typeof invitations | typeof guests | typeof rsvps | typeof blasts | typeof music | typeof content) {
  return db.select({ count: count() }).from(table).get()?.count ?? 0;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function GET(request: NextRequest) {
  const session = readDemoSession(request.cookies);
  if (!session.isAuthenticated) return NextResponse.json({ error: "Sesi admin diperlukan." }, { status: 401 });
  if (session.isBlocked) return NextResponse.json({ error: "Akun pengguna sedang diblokir." }, { status: 403 });
  if (!session.isAdmin) return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });

  const periodParam = request.nextUrl.searchParams.get("period") ?? "7d";
  if (!(periodParam in supportedPeriods)) {
    return NextResponse.json({ error: "period harus berupa 7d, 30d, atau 90d." }, { status: 400 });
  }

  const period = periodParam as StatsPeriod;
  const days = supportedPeriods[period];
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const userStatus = {
      active: db.select({ count: count() }).from(users).where(eq(users.status, "active")).get()?.count ?? 0,
      blocked: db.select({ count: count() }).from(users).where(eq(users.status, "blocked")).get()?.count ?? 0,
      invited: db.select({ count: count() }).from(users).where(eq(users.status, "invited")).get()?.count ?? 0,
    };
    const invitationStatus = {
      published: db.select({ count: count() }).from(invitations).where(eq(invitations.status, "published")).get()?.count ?? 0,
      draft: db.select({ count: count() }).from(invitations).where(eq(invitations.status, "draft")).get()?.count ?? 0,
    };
    const rsvpRows = db.select({ status: rsvps.status, partySize: rsvps.partySize }).from(rsvps).all();
    const rsvpStatus = { attending: 0, declined: 0, maybe: 0 };
    const attendingGuests = rsvpRows.reduce((total, row) => {
      rsvpStatus[row.status] += 1;
      return total + (row.status === "attending" ? Math.max(0, row.partySize) : 0);
    }, 0);
    const blastRows = db.select({ status: blasts.status }).from(blasts).all();
    const blastStatus = blastRows.reduce<Record<string, number>>((result, row) => {
      result[row.status] = (result[row.status] ?? 0) + 1;
      return result;
    }, {});
    const activityByDate = new Map<string, { invitations: number; rsvps: number }>();
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(now.getTime() - index * 24 * 60 * 60 * 1000);
      activityByDate.set(dateKey(date), { invitations: 0, rsvps: 0 });
    }
    const recentInvitations = db.select({ createdAt: invitations.createdAt }).from(invitations).where(gte(invitations.createdAt, from)).all();
    const recentRsvps = db.select({ createdAt: rsvps.createdAt }).from(rsvps).where(gte(rsvps.createdAt, from)).all();
    for (const row of recentInvitations) {
      const bucket = activityByDate.get(dateKey(row.createdAt));
      if (bucket) bucket.invitations += 1;
    }
    for (const row of recentRsvps) {
      const bucket = activityByDate.get(dateKey(row.createdAt));
      if (bucket) bucket.rsvps += 1;
    }

    return NextResponse.json({
      data: {
        period: { key: period, days, from: from.toISOString(), to: now.toISOString() },
        totals: {
          users: countRows(users),
          activeUsers: userStatus.active,
          blockedUsers: userStatus.blocked,
          invitedUsers: userStatus.invited,
          invitations: countRows(invitations),
          activeInvitations: invitationStatus.published,
          draftInvitations: invitationStatus.draft,
          guests: countRows(guests),
          rsvps: rsvpRows.length,
          attendingGuests,
          musicTracks: countRows(music),
          activeMusicTracks: db.select({ count: count() }).from(music).where(eq(music.isActive, true)).get()?.count ?? 0,
          contentItems: countRows(content),
        },
        status: { users: userStatus, invitations: invitationStatus, rsvps: rsvpStatus, blasts: blastStatus },
        activity: Array.from(activityByDate, ([date, values]) => ({ date, ...values })),
      },
    });
  } catch (error) {
    console.error("Failed to read admin statistics", error);
    return NextResponse.json({ error: "Statistik admin belum bisa dimuat." }, { status: 500 });
  }
}
