import type { Guest } from "../db/schema";

export function serializeGuest(guest: Guest) {
  return {
    id: guest.id,
    invitationId: guest.invitationId,
    name: guest.name,
    phone: guest.phone,
    groupName: guest.groupName,
    notes: guest.notes,
    createdAt: guest.createdAt.toISOString(),
    updatedAt: guest.updatedAt.toISOString(),
  };
}
