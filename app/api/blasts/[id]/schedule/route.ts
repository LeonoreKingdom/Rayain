import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { db } from "../../../../../lib/db";
import { blasts, type Blast } from "../../../../../lib/db/schema";
import { serializeBlast } from "../../../../../lib/blasts/serialize";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const blastId = id.trim();
  if (!blastId) return Response.json({ error: "ID blast wajib diisi." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body) || typeof (body as { scheduledAt?: unknown }).scheduledAt !== "string") {
    return Response.json({ error: "scheduledAt wajib berupa tanggal ISO yang valid." }, { status: 400 });
  }
  const scheduledAt = new Date((body as { scheduledAt: string }).scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) return Response.json({ error: "scheduledAt harus berada di masa depan." }, { status: 400 });

  const current = db.select().from(blasts).where(eq(blasts.id, blastId)).get();
  if (!current) return Response.json({ error: "Blast tidak ditemukan." }, { status: 404 });
  if (current.status === "completed" || current.status === "cancelled") return Response.json({ error: "Blast ini tidak dapat dijadwalkan ulang." }, { status: 409 });

  try {
    const updated = db.update(blasts).set({ status: "scheduled", scheduledAt, startedAt: null, completedAt: null, updatedAt: new Date() }).where(eq(blasts.id, blastId)).returning().get();
    if (!updated) return Response.json({ error: "Blast tidak ditemukan." }, { status: 404 });
    return Response.json({ data: serializeBlast(updated as Blast), message: "Pesan berhasil dijadwalkan." });
  } catch (error) {
    console.error("Failed to schedule blast", error);
    return Response.json({ error: "Blast belum bisa dijadwalkan." }, { status: 500 });
  }
}
