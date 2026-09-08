import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "../../../../../lib/auth/admin";
import { db } from "../../../../../lib/db";
import {
  invitationTypes,
  templates,
  type NewTemplate,
  type Template,
} from "../../../../../lib/db/schema";
import { serializeTemplate } from "../../../../../lib/templates/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInvitationType(
  value: unknown,
): value is (typeof invitationTypes)[number] {
  return (
    typeof value === "string" &&
    invitationTypes.includes(value as (typeof invitationTypes)[number])
  );
}

function readTextField(body: Record<string, unknown>, key: string) {
  if (!(key in body)) return { value: undefined as string | undefined };
  if (typeof body[key] !== "string" || !body[key].trim())
    return { error: `${key} harus berupa teks yang tidak kosong.` };
  const value = body[key].trim();
  if (value.length > 120) return { error: `${key} maksimal 120 karakter.` };
  return { value };
}

function readNullableTextField(body: Record<string, unknown>, keys: string[]) {
  const key = keys.find((candidate) => candidate in body);
  if (!key) return { value: undefined as string | null | undefined };
  if (body[key] === null) return { value: null as string | null };
  if (typeof body[key] !== "string")
    return { error: `${key} harus berupa teks atau null.` };
  const value = body[key].trim();
  if (value.length > 500) return { error: `${key} maksimal 500 karakter.` };
  return { value: value || null };
}

function readDesignField(body: Record<string, unknown>) {
  const key = ["defaultDesign", "designData", "default_design"].find(
    (candidate) => candidate in body,
  );
  if (!key) return { value: undefined as Record<string, unknown> | undefined };
  const raw = body[key];
  if (isRecord(raw)) return { value: raw };
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isRecord(parsed)) return { value: parsed };
    } catch {
      // Return the validation message below.
    }
  }
  return { error: "defaultDesign harus berupa object JSON." };
}

function readBooleanField(body: Record<string, unknown>) {
  const key = ["isActive", "active"].find((candidate) => candidate in body);
  if (!key) return { value: undefined as boolean | undefined };
  if (typeof body[key] !== "boolean")
    return { error: `${key} harus berupa boolean.` };
  return { value: body[key] };
}

async function readTemplate(params: RouteContext) {
  const { id } = await params.params;
  const templateId = id.trim();
  return {
    templateId,
    template: templateId
      ? db.select().from(templates).where(eq(templates.id, templateId)).get()
      : undefined,
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;
  const { templateId, template } = await readTemplate({ params });
  if (!templateId)
    return NextResponse.json(
      { error: "ID template wajib diisi." },
      { status: 400 },
    );
  if (!template)
    return NextResponse.json(
      { error: "Template tidak ditemukan." },
      { status: 404 },
    );
  return NextResponse.json({ data: serializeTemplate(template) });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;
  const { templateId, template } = await readTemplate({ params });
  if (!templateId)
    return NextResponse.json(
      { error: "ID template wajib diisi." },
      { status: 400 },
    );
  if (!template)
    return NextResponse.json(
      { error: "Template tidak ditemukan." },
      { status: 404 },
    );

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

  const name = readTextField(body, "name");
  const thumbnailUrl = readNullableTextField(body, [
    "thumbnailUrl",
    "thumbnail_url",
  ]);
  const design = readDesignField(body);
  const isActive = readBooleanField(body);
  const fieldErrors = [name, thumbnailUrl, design, isActive]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));
  if (fieldErrors.length)
    return NextResponse.json({ error: fieldErrors[0] }, { status: 400 });
  if ("eventType" in body && !isInvitationType(body.eventType)) {
    return NextResponse.json(
      {
        error: `eventType harus salah satu dari: ${invitationTypes.join(", ")}.`,
      },
      { status: 400 },
    );
  }
  if (Object.keys(body).length === 0)
    return NextResponse.json(
      { error: "Kirim minimal satu field untuk diperbarui." },
      { status: 400 },
    );

  const updates: Partial<NewTemplate> = { updatedAt: new Date() };
  if (name.value !== undefined) updates.name = name.value;
  if ("eventType" in body)
    updates.eventType = body.eventType as (typeof invitationTypes)[number];
  if (thumbnailUrl.value !== undefined)
    updates.thumbnailUrl = thumbnailUrl.value;
  if (design.value !== undefined)
    updates.defaultDesign = JSON.stringify(design.value);
  if (isActive.value !== undefined) updates.isActive = isActive.value;
  if (Object.keys(updates).length === 1)
    return NextResponse.json(
      { error: "Kirim minimal satu field untuk diperbarui." },
      { status: 400 },
    );

  try {
    const updated = db
      .update(templates)
      .set(updates)
      .where(eq(templates.id, templateId))
      .returning()
      .get();
    return updated
      ? NextResponse.json({
          data: serializeTemplate(updated as Template),
          message: "Template berhasil diperbarui.",
        })
      : NextResponse.json(
          { error: "Template tidak ditemukan." },
          { status: 404 },
        );
  } catch (error) {
    console.error("Failed to update admin template", error);
    return NextResponse.json(
      { error: "Template belum bisa diperbarui." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const authorization = authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;
  const { templateId } = await readTemplate({ params });
  if (!templateId)
    return NextResponse.json(
      { error: "ID template wajib diisi." },
      { status: 400 },
    );

  try {
    const deleted = db
      .delete(templates)
      .where(eq(templates.id, templateId))
      .returning({ id: templates.id })
      .get();
    return deleted
      ? NextResponse.json({
          data: deleted,
          message: "Template berhasil dihapus.",
        })
      : NextResponse.json(
          { error: "Template tidak ditemukan." },
          { status: 404 },
        );
  } catch (error) {
    console.error("Failed to delete admin template", error);
    return NextResponse.json(
      { error: "Template belum bisa dihapus." },
      { status: 500 },
    );
  }
}
