export type RsvpOptions = {
  enabled: boolean;
  plusOneEnabled: boolean;
  partySizeEnabled: boolean;
  deadlineEnabled: boolean;
  deadline: string | null;
  successMessage: string;
};

export const defaultRsvpOptions: RsvpOptions = {
  enabled: true,
  plusOneEnabled: true,
  partySizeEnabled: true,
  deadlineEnabled: false,
  deadline: null,
  successMessage: "Terima kasih, sampai jumpa di hari bahagia kami.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRsvpOptions(value: string): RsvpOptions {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = {};
  }

  if (!isRecord(parsed)) return { ...defaultRsvpOptions };
  const deadline = typeof parsed.deadline === "string" && parsed.deadline.trim()
    ? parsed.deadline.trim()
    : typeof parsed.deadlineAt === "string" && parsed.deadlineAt.trim()
      ? parsed.deadlineAt.trim()
      : null;
  return {
    enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : typeof parsed.rsvpEnabled === "boolean" ? parsed.rsvpEnabled : defaultRsvpOptions.enabled,
    plusOneEnabled: typeof parsed.plusOneEnabled === "boolean" ? parsed.plusOneEnabled : typeof parsed.allowPlusOne === "boolean" ? parsed.allowPlusOne : defaultRsvpOptions.plusOneEnabled,
    partySizeEnabled: typeof parsed.partySizeEnabled === "boolean" ? parsed.partySizeEnabled : typeof parsed.askPartySize === "boolean" ? parsed.askPartySize : defaultRsvpOptions.partySizeEnabled,
    deadlineEnabled: typeof parsed.deadlineEnabled === "boolean" ? parsed.deadlineEnabled : Boolean(deadline),
    deadline,
    successMessage: typeof parsed.successMessage === "string" ? parsed.successMessage : defaultRsvpOptions.successMessage,
  };
}
