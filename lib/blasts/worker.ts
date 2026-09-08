import { and, eq, lte } from "drizzle-orm";
import { db } from "../db";
import { blastLogs, blasts, type Blast } from "../db/schema";

export type BlastProcessResult =
  | { status: "processed"; blast: Blast; sentCount: number; mode: "mock" }
  | { status: "skipped"; blast: Blast; reason: "already-complete" | "cancelled" }
  | { status: "not-due"; blast: Blast }
  | { status: "not-found" };

/**
 * Processes one blast through the local delivery adapter.
 * The adapter is intentionally deterministic until a WhatsApp provider is configured.
 */
export function processBlast(blastId: string, now = new Date()): BlastProcessResult {
  const current = db.select().from(blasts).where(eq(blasts.id, blastId)).get();
  if (!current) return { status: "not-found" };
  if (current.status === "completed") return { status: "skipped", blast: current, reason: "already-complete" };
  if (current.status === "cancelled") return { status: "skipped", blast: current, reason: "cancelled" };
  if (current.status === "scheduled" && (!current.scheduledAt || current.scheduledAt.getTime() > now.getTime())) {
    return { status: "not-due", blast: current };
  }

  const processed = db.transaction((tx) => {
    tx.update(blasts)
      .set({ status: "sending", startedAt: current.startedAt ?? now, updatedAt: now })
      .where(eq(blasts.id, blastId))
      .run();
    const queuedLogs = tx
      .select({ id: blastLogs.id })
      .from(blastLogs)
      .where(and(eq(blastLogs.blastId, blastId), eq(blastLogs.status, "queued")))
      .all();
    if (queuedLogs.length) {
      tx.update(blastLogs)
        .set({ status: "sent", sentAt: now, errorMessage: null })
        .where(and(eq(blastLogs.blastId, blastId), eq(blastLogs.status, "queued")))
        .run();
    }
    return tx
      .update(blasts)
      .set({
        status: "completed",
        completedAt: now,
        sentCount: current.sentCount + queuedLogs.length,
        updatedAt: now,
      })
      .where(eq(blasts.id, blastId))
      .returning()
      .get();
  });

  return { status: "processed", blast: processed ?? current, sentCount: processed?.sentCount ?? current.sentCount, mode: "mock" };
}

export function processDueBlasts(now = new Date()) {
  const dueBlasts = db
    .select({ id: blasts.id })
    .from(blasts)
    .where(and(eq(blasts.status, "scheduled"), lte(blasts.scheduledAt, now)))
    .all();
  return dueBlasts.map(({ id }) => processBlast(id, now));
}
