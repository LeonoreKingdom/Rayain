import { eq } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { blasts, type Blast } from "../../../../../lib/db/schema";
import { serializeBlast } from "../../../../../lib/blasts/serialize";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const blastId = id.trim();
  if (!blastId) return Response.json({ error: "ID blast wajib diisi." }, { status: 400 });

  const current = await db.select().from(blasts).where(eq(blasts.id, blastId)).get();
  if (!current) return Response.json({ error: "Blast tidak ditemukan." }, { status: 404 });
  if (current.status === "cancelled") return Response.json({ data: serializeBlast(current), message: "Jadwal blast sudah dibatalkan." });
  if (current.status !== "scheduled") return Response.json({ error: "Hanya blast yang terjadwal yang dapat dibatalkan." }, { status: 409 });

  try {
    const updated = await db
      .update(blasts)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(blasts.id, blastId))
      .returning()
      .get();
    if (!updated) return Response.json({ error: "Blast tidak ditemukan." }, { status: 404 });
    return Response.json({ data: serializeBlast(updated as Blast), message: "Jadwal blast berhasil dibatalkan." });
  } catch (error) {
    console.error("Failed to cancel blast", error);
    return Response.json({ error: "Jadwal blast belum bisa dibatalkan." }, { status: 500 });
  }
}
