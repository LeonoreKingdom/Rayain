import type { Invitation } from "../db/schema";

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {};
  }
}

export function serializeInvitation(invitation: Invitation, origin: string) {
  const publicPath = `/undangan/${invitation.slug}`;

  return {
    id: invitation.id,
    slug: invitation.slug,
    userId: invitation.userId,
    templateId: invitation.templateId,
    musicId: invitation.musicId,
    title: invitation.title,
    eventType: invitation.eventType,
    eventDate: invitation.eventDate,
    eventTime: invitation.eventTime,
    location: invitation.location,
    message: invitation.message,
    content: parseJson(invitation.content),
    designData: parseJson(invitation.designData),
    rsvpOptions: parseJson(invitation.rsvpOptions),
    musicAutoplay: invitation.musicAutoplay,
    template: invitation.template,
    style: {
      color: invitation.color,
      font: invitation.font,
      photo: invitation.photo,
      layout: invitation.layout,
    },
    status: invitation.status,
    guestCount: invitation.guestCount,
    publishedAt: invitation.publishedAt?.toISOString() ?? null,
    createdAt: invitation.createdAt.toISOString(),
    updatedAt: invitation.updatedAt.toISOString(),
    publicPath,
    publicUrl: new URL(publicPath, origin).toString(),
  };
}
