import { and, asc, eq, type SQL } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { invitationTypes, templates, type Template } from "../../../lib/db/schema";
import { serializeTemplate } from "../../../lib/templates/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isInvitationType(value: string | null): value is (typeof invitationTypes)[number] {
  return value !== null && invitationTypes.includes(value as (typeof invitationTypes)[number]);
}

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventType = searchParams.get("eventType") ?? searchParams.get("category");
  const activeParam = searchParams.get("active");

  if (eventType && !isInvitationType(eventType)) {
    return NextResponse.json(
      { error: `eventType harus salah satu dari: ${invitationTypes.join(", ")}.` },
      { status: 400 },
    );
  }

  if (activeParam && activeParam !== "true" && activeParam !== "false") {
    return NextResponse.json({ error: "active harus berupa true atau false." }, { status: 400 });
  }

  const eventTypeFilter = isInvitationType(eventType) ? eventType : undefined;

  try {
    const filters: SQL[] = [eq(templates.isActive, activeParam !== "false")];
    if (eventTypeFilter) filters.push(eq(templates.eventType, eventTypeFilter));
    const rows = db
      .select()
      .from(templates)
      .where(and(...filters))
      .orderBy(asc(templates.name))
      .all();

    return NextResponse.json({
      data: rows.map((template: Template) => serializeTemplate(template)),
      count: rows.length,
    });
  } catch (error) {
    console.error("Failed to list templates", error);
    return NextResponse.json(
      { error: "Template belum bisa dimuat. Pastikan database sudah dimigrasikan." },
      { status: 500 },
    );
  }
}
