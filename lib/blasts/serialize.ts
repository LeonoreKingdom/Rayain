import type { Blast, BlastLog } from "../db/schema";

export function serializeBlast(blast: Blast) {
  return {
    id: blast.id,
    invitationId: blast.invitationId,
    channel: blast.channel,
    message: blast.message,
    status: blast.status,
    scheduledAt: blast.scheduledAt?.toISOString() ?? null,
    startedAt: blast.startedAt?.toISOString() ?? null,
    completedAt: blast.completedAt?.toISOString() ?? null,
    totalRecipients: blast.totalRecipients,
    sentCount: blast.sentCount,
    failedCount: blast.failedCount,
    createdAt: blast.createdAt.toISOString(),
    updatedAt: blast.updatedAt.toISOString(),
  };
}

export function serializeBlastLog(log: BlastLog) {
  return {
    id: log.id,
    blastId: log.blastId,
    guestId: log.guestId,
    recipientName: log.recipientName,
    recipientPhone: log.recipientPhone,
    status: log.status,
    errorMessage: log.errorMessage,
    sentAt: log.sentAt?.toISOString() ?? null,
    createdAt: log.createdAt.toISOString(),
  };
}
