import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { invitations, type NewInvitation } from "../../../../../lib/db/schema";
import { defaultRsvpOptions, parseRsvpOptions, type RsvpOptions } from "../../../../../lib/rsvps/options";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getInvitationId(params: RouteContext) {
  return params.params.then(({ id }) => id.trim());
}

function serializeOptions(invitationId: string, value: string) {
  return { invitationId, options: parseRsvpOptions(value) };
}

function getOptionSource(body: Record<string, unknown>) {
  const source = body.options ?? body.rsvpOptions;
  return source === undefined ? body : source;
}

function readBooleanOption(source: Record<string, unknown>, keys: string[], fieldName: string) {
  const key = keys.find((candidate) => candidate in source);
  if (!key) return { value: undefined as boolean | undefined };
  if (typeof source[key] !== "boolean") return { error: `${fieldName} harus berupa boolean.` };
  return { value: source[key] };
}

function readDeadline(source: Record<string, unknown>) {
  if (!("deadline" in source) && !("deadlineAt" in source)) return { value: undefined as string | null | undefined };
  const value = source.deadline ?? source.deadlineAt;
  if (value === null || value === "") return { value: null as string | null };
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return { error: "deadline harus berupa tanggal dengan format YYYY-MM-DD atau null." };
  }
  return { value: value.trim() };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const invitationId = await getInvitationId({ params });
  if (!invitationId) return NextResponse.json({ error: "ID undangan wajib diisi." }, { status: 400 });

  try {
    const invitation = db.select({ id: invitations.id, rsvpOptions: invitations.rsvpOptions }).from(invitations).where(eq(invitations.id, invitationId)).get();
    if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ data: serializeOptions(invitation.id, invitation.rsvpOptions) });
  } catch (error) {
    console.error("Failed to read RSVP options", error);
    return NextResponse.json({ error: "Opsi RSVP belum bisa dimuat." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const invitationId = await getInvitationId({ params });
  if (!invitationId) return NextResponse.json({ error: "ID undangan wajib diisi." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Body request harus berupa object JSON." }, { status: 400 });

  const source = getOptionSource(body);
  if (!isRecord(source)) return NextResponse.json({ error: "options harus berupa object JSON." }, { status: 400 });

  const enabled = readBooleanOption(source, ["enabled", "rsvpEnabled", "acceptRsvp"], "enabled");
  const plusOneEnabled = readBooleanOption(source, ["plusOneEnabled", "allowPlusOne"], "plusOneEnabled");
  const partySizeEnabled = readBooleanOption(source, ["partySizeEnabled", "askPartySize"], "partySizeEnabled");
  const deadlineEnabled = readBooleanOption(source, ["deadlineEnabled"], "deadlineEnabled");
  const deadline = readDeadline(source);
  const successMessage = "successMessage" in source ? source.successMessage : undefined;
  const fieldErrors = [enabled, plusOneEnabled, partySizeEnabled, deadlineEnabled, deadline]
    .map((field) => field.error)
    .filter((error): error is string => Boolean(error));
  if (fieldErrors.length) return NextResponse.json({ error: fieldErrors[0] }, { status: 400 });
  if (successMessage !== undefined && (typeof successMessage !== "string" || successMessage.length > 120)) {
    return NextResponse.json({ error: "successMessage harus berupa teks maksimal 120 karakter." }, { status: 400 });
  }

  try {
    const current = db.select({ id: invitations.id, rsvpOptions: invitations.rsvpOptions }).from(invitations).where(eq(invitations.id, invitationId)).get();
    if (!current) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

    const nextOptions: RsvpOptions = {
      ...defaultRsvpOptions,
      ...parseRsvpOptions(current.rsvpOptions),
      ...(enabled.value === undefined ? {} : { enabled: enabled.value }),
      ...(plusOneEnabled.value === undefined ? {} : { plusOneEnabled: plusOneEnabled.value }),
      ...(partySizeEnabled.value === undefined ? {} : { partySizeEnabled: partySizeEnabled.value }),
      ...(deadlineEnabled.value === undefined ? {} : { deadlineEnabled: deadlineEnabled.value }),
      ...(deadline.value === undefined ? {} : { deadline: deadline.value }),
      ...(successMessage === undefined ? {} : { successMessage: successMessage.trim() }),
    };

    const updated = db.update(invitations)
      .set({ rsvpOptions: JSON.stringify(nextOptions), updatedAt: new Date() } satisfies Partial<NewInvitation>)
      .where(eq(invitations.id, invitationId))
      .returning({ id: invitations.id, rsvpOptions: invitations.rsvpOptions })
      .get();
    if (!updated) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ data: serializeOptions(updated.id, updated.rsvpOptions), message: "Opsi RSVP berhasil disimpan." });
  } catch (error) {
    console.error("Failed to save RSVP options", error);
    return NextResponse.json({ error: "Opsi RSVP belum bisa disimpan." }, { status: 500 });
  }
}
