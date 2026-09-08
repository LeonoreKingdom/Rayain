import type { Notification } from "../db/schema";

export function serializeNotification(notification: Notification) {
  return {
    id: notification.id,
    userId: notification.userId,
    invitationId: notification.invitationId,
    rsvpId: notification.rsvpId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    isRead: notification.isRead,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}
