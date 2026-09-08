import { and, desc, eq, type SQL } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { notificationTypes, notifications, type NewNotification } from "../../../lib/db/schema";
import { serializeNotification } from "../../../lib/notifications/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBoolean(value: unknown, fieldName: string) {
  if (typeof value !== "boolean") return { error: `${fieldName} harus berupa boolean.` };
  return { value };
}

function getScope(searchParams: URLSearchParams, body?: Record<string, unknown>) {
  const invitationId = searchParams.get("invitationId")?.trim() || (typeof body?.invitationId === "string" ? body.invitationId.trim() : "");
  const userId = searchParams.get("userId")?.trim() || (typeof body?.userId === "string" ? body.userId.trim() : "");
  const filters: SQL[] = [];
  if (invitationId) filters.push(eq(notifications.invitationId, invitationId));
  if (userId) filters.push(eq(notifications.userId, userId));
  return { invitationId, userId, filters };
}

function getReadValue(body: Record<string, unknown>) {
  if ("isRead" in body) return readBoolean(body.isRead, "isRead");
  if ("read" in body) return readBoolean(body.read, "read");
  if (body.action === "read" || body.action === "read-all") return { value: true };
  if (body.action === "unread") return { value: false };
  return { error: "Kirim isRead sebagai boolean atau action read/unread." };
}

function addListFilters(request: NextRequest, filters: SQL[]) {
  const searchParams = request.nextUrl.searchParams;
  const unread = searchParams.get("unread");
  const isRead = searchParams.get("isRead");
  if (unread !== null && unread !== "true" && unread !== "false") return { error: "unread harus berupa true atau false." };
  if (isRead !== null && isRead !== "true" && isRead !== "false") return { error: "isRead harus berupa true atau false." };
  if (unread !== null) filters.push(eq(notifications.isRead, unread !== "true"));
  if (isRead !== null) filters.push(eq(notifications.isRead, isRead === "true"));

  const type = searchParams.get("type")?.trim();
  if (type && !notificationTypes.includes(type as (typeof notificationTypes)[number])) {
    return { error: `type harus salah satu dari: ${notificationTypes.join(", ")}.` };
  }
  if (type) filters.push(eq(notifications.type, type as (typeof notificationTypes)[number]));
  return {};
}

export async function GET(request: NextRequest) {
  const scope = getScope(request.nextUrl.searchParams);
  if (!scope.filters.length) return NextResponse.json({ error: "Kirim invitationId atau userId untuk membaca notifikasi." }, { status: 400 });
  const listFilter = addListFilters(request, scope.filters);
  if (listFilter.error) return NextResponse.json({ error: listFilter.error }, { status: 400 });

  try {
    const rows = await db.select().from(notifications).where(and(...scope.filters)).orderBy(desc(notifications.createdAt)).all();
    return NextResponse.json({ data: rows.map(serializeNotification), count: rows.length, unreadCount: rows.filter((notification) => !notification.isRead).length });
  } catch (error) {
    console.error("Failed to list notifications", error);
    return NextResponse.json({ error: "Notifikasi belum bisa dimuat." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Body request harus berupa object JSON." }, { status: 400 });

  const scope = getScope(request.nextUrl.searchParams, body);
  if (!scope.filters.length) return NextResponse.json({ error: "Kirim invitationId atau userId untuk memperbarui notifikasi." }, { status: 400 });
  const readValue = getReadValue(body);
  if (readValue.error) return NextResponse.json({ error: readValue.error }, { status: 400 });

  try {
    const now = new Date();
    const updates: Partial<NewNotification> = { isRead: readValue.value!, readAt: readValue.value! ? now : null };
    const result = await db.update(notifications).set(updates).where(and(...scope.filters)).run();
    return NextResponse.json({ data: { updated: result.rowsAffected, isRead: readValue.value }, message: "Status notifikasi berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update notifications", error);
    return NextResponse.json({ error: "Status notifikasi belum bisa diperbarui." }, { status: 500 });
  }
}
