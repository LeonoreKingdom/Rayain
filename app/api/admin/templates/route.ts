import { randomUUID } from "node:crypto";
import { and, asc, eq, like, or, type SQL } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "../../../../lib/auth/admin";
import { db } from "../../../../lib/db";
import {
  invitationTypes,
  templates,
  type NewTemplate,
  type Template,
} from "../../../../lib/db/schema";
import { serializeTemplate } from "../../../../lib/templates/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInvitationType(
  value: string | null,
): value is (typeof invitationTypes)[number] {
  return (
    value !== null &&
    invitationTypes.includes(value as (typeof invitationTypes)[number])
  );
}

function readRequiredText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim())
    return { error: `${label} wajib diisi.` };
  const text = value.trim();
  if (text.length > 120) return { error: `${label} maksimal 120 karakter.` };
  return { value: text };
}

function readNullableText(value: unknown, label: string) {
  if (value === null || value === undefined)
    return { value: null as string | null };
  if (typeof value !== "string")
    return { error: `${label} harus berupa teks atau null.` };
  const text = value.trim();
  if (text.length > 500) return { error: `${label} maksimal 500 karakter.` };
  return { value: text || null };
}

function readDesign(value: unknown) {
  if (value === undefined) return { value: {} as Record<string, unknown> };
  if (isRecord(value)) return { value };
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (isRecord(parsed)) return { value: parsed };
    } catch {
      // Return the validation message below.
    }
  }
  return { error: "defaultDesign harus berupa object JSON." };
}

function readBoolean(value: unknown, label: string, fallback: boolean) {
  if (value === undefined) return { value: fallback };
  if (typeof value !== "boolean")
    return { error: `${label} harus berupa boolean.` };
  return { value };
}

function readActiveParam(value: string | null) {
  if (!value || value === "all")
    return { value: undefined as boolean | undefined };
  if (value === "true") return { value: true };
  if (value === "false") return { value: false };
  return { error: "active harus berupa true, false, atau all." };
}

export async function GET(request: NextRequest) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  const searchParams = request.nextUrl.searchParams;
  const query = (searchParams.get("q") ?? searchParams.get("search"))?.trim();
  const eventType =
    searchParams.get("eventType") ?? searchParams.get("category");
  const active = readActiveParam(
    searchParams.get("active") ?? searchParams.get("isActive"),
  );
  if (eventType && !isInvitationType(eventType)) {
    return NextResponse.json(
      {
        error: `eventType harus salah satu dari: ${invitationTypes.join(", ")}.`,
      },
      { status: 400 },
    );
  }
  if ("error" in active)
    return NextResponse.json({ error: active.error }, { status: 400 });

  try {
    const filters: SQL[] = [];
    if (active.value !== undefined)
      filters.push(eq(templates.isActive, active.value));
    if (eventType && isInvitationType(eventType))
      filters.push(eq(templates.eventType, eventType));
    if (query) {
      const pattern = `%${query}%`;
      filters.push(
        or(like(templates.name, pattern), like(templates.id, pattern))!,
      );
    }
    const queryBuilder = db.select().from(templates);
    const rows = await (
      filters.length ? queryBuilder.where(and(...filters)) : queryBuilder
    )
      .orderBy(asc(templates.name))
      .all();
    return NextResponse.json({
      data: rows.map((template: Template) => serializeTemplate(template)),
      count: rows.length,
    });
  } catch (error) {
    console.error("Failed to list admin templates", error);
    return NextResponse.json(
      { error: "Daftar template admin belum bisa dimuat." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 },
    );
  }
  if (!isRecord(body))
    return NextResponse.json(
      { error: "Body request harus berupa object JSON." },
      { status: 400 },
    );

  const name = readRequiredText(body.name, "Nama template");
  const eventTypeValue =
    typeof body.eventType === "string" ? body.eventType.trim() : null;
  const design = readDesign(
    body.defaultDesign ?? body.designData ?? body.default_design,
  );
  const thumbnailUrl = readNullableText(
    body.thumbnailUrl ?? body.thumbnail_url,
    "thumbnailUrl",
  );
  const isActive = readBoolean(body.isActive ?? body.active, "isActive", true);
  if ("error" in name)
    return NextResponse.json({ error: name.error }, { status: 400 });
  if (!isInvitationType(eventTypeValue))
    return NextResponse.json(
      {
        error: `eventType harus salah satu dari: ${invitationTypes.join(", ")}.`,
      },
      { status: 400 },
    );
  if ("error" in design)
    return NextResponse.json({ error: design.error }, { status: 400 });
  if ("error" in thumbnailUrl)
    return NextResponse.json({ error: thumbnailUrl.error }, { status: 400 });
  if ("error" in isActive)
    return NextResponse.json({ error: isActive.error }, { status: 400 });

  const values: NewTemplate = {
    id: randomUUID(),
    name: name.value,
    eventType: eventTypeValue,
    thumbnailUrl: thumbnailUrl.value,
    defaultDesign: JSON.stringify(design.value),
    isActive: isActive.value,
  };
  try {
    const created = await db.insert(templates).values(values).returning().get();
    return NextResponse.json(
      {
        data: serializeTemplate(created),
        message: "Template berhasil ditambahkan.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create admin template", error);
    return NextResponse.json(
      { error: "Template baru belum bisa ditambahkan." },
      { status: 500 },
    );
  }
}
