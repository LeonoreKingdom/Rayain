import { eq } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { blasts } from "../../../../../lib/db/schema";
import { processBlast } from "../../../../../lib/blasts/worker";
import { serializeBlast } from "../../../../../lib/blasts/serialize";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const blastId = id.trim();
  if (!blastId) return Response.json({ error: "ID blast wajib diisi." }, { status: 400 });

  const current = await db.select().from(blasts).where(eq(blasts.id, blastId)).get();
  if (!current) return Response.json({ error: "Blast tidak ditemukan." }, { status: 404 });
  if (current.status === "cancelled") return Response.json({ error: "Blast yang dibatalkan tidak dapat dikirim." }, { status: 409 });
  if (current.status === "completed") return Response.json({ data: serializeBlast(current), message: "Blast sudah pernah dikirim." });

  try {
    const result = await processBlast(blastId);
    if (result.status === "not-found") return Response.json({ error: "Blast tidak ditemukan." }, { status: 404 });
    if (result.status === "not-due") return Response.json({ error: "Blast terjadwal belum waktunya dikirim." }, { status: 409 });
    if (result.status === "skipped" && result.reason === "cancelled") return Response.json({ error: "Blast yang dibatalkan tidak dapat dikirim." }, { status: 409 });
    return Response.json({ data: serializeBlast(result.blast), message: "Pesan berhasil dikirim.", deliveryMode: "mock" });
  } catch (error) {
    console.error("Failed to send blast", error);
    return Response.json({ error: "Blast belum bisa dikirim." }, { status: 500 });
  }
}
