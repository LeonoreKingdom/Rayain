import type { RSVP } from "../db/schema";

export const rsvpStatusLabels: Record<RSVP["status"], string> = {
  attending: "Hadir",
  declined: "Tidak hadir",
  maybe: "Masih ragu",
};

export function serializeRSVP(rsvp: RSVP) {
  return {
    id: rsvp.id,
    invitationId: rsvp.invitationId,
    guestId: rsvp.guestId,
    name: rsvp.name,
    phone: rsvp.phone,
    status: rsvp.status,
    statusLabel: rsvpStatusLabels[rsvp.status],
    partySize: rsvp.partySize,
    message: rsvp.message,
    respondedAt: rsvp.respondedAt?.toISOString() ?? null,
    createdAt: rsvp.createdAt.toISOString(),
    updatedAt: rsvp.updatedAt.toISOString(),
  };
}
