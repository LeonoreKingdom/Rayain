import { asc, eq } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { blastLogs, blasts, type Blast, type BlastLog } from "../../../../../lib/db/schema";
import { serializeBlast, serializeBlastLog } from "../../../../../lib/blasts/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const blastId = id.trim();
  if (!blastId) return Response.json({ error: "ID blast wajib diisi." }, { status: 400 });

  try {
    const blast = db.select().from(blasts).where(eq(blasts.id, blastId)).get();
    if (!blast) return Response.json({ error: "Blast tidak ditemukan." }, { status: 404 });
    const logs = db.select().from(blastLogs).where(eq(blastLogs.blastId, blastId)).orderBy(asc(blastLogs.createdAt)).all();
    const summary = logs.reduce(
      (result, log) => {
        result[log.status] += 1;
        return result;
      },
      { queued: 0, sent: 0, failed: 0 },
    );

    return Response.json({
      data: {
        blast: serializeBlast(blast as Blast),
        logs: logs.map((log: BlastLog) => serializeBlastLog(log)),
        count: logs.length,
        summary,
      },
    });
  } catch (error) {
    console.error("Failed to read blast history", error);
    return Response.json({ error: "Riwayat status pengiriman belum bisa dimuat." }, { status: 500 });
  }
}
