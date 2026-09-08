import type { Template } from "../db/schema";

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {};
  }
}

export function serializeTemplate(template: Template) {
  return {
    id: template.id,
    name: template.name,
    eventType: template.eventType,
    thumbnailUrl: template.thumbnailUrl,
    defaultDesign: parseJson(template.defaultDesign),
    isActive: template.isActive,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}
