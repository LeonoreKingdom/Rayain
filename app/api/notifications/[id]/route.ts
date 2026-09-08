import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { notifications, type NewNotification } from "../../../../lib/db/schema";
import { serializeNotification } from "../../../../lib/notifications/serialize";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readValue(body: Record<string, unknown>) {
  if ("isRead" in body) return body.isRead;
  if ("read" in body) return body.read;
  if (body.action === "read") return true;
  if (body.action === "unread") return false;
  return undefined;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const notificationId = id.trim();
  if (!notificationId) return NextResponse.json({ error: "ID notifikasi wajib diisi." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
  }
  if (!isRecord(body)) return NextResponse.json({ error: "Body request harus berupa object JSON." }, { status: 400 });

  const isRead = readValue(body);
  if (typeof isRead !== "boolean") return NextResponse.json({ error: "isRead harus berupa boolean atau action read/unread." }, { status: 400 });

  try {
    const updated = db.update(notifications)
      .set({ isRead, readAt: isRead ? new Date() : null } satisfies Partial<NewNotification>)
      .where(eq(notifications.id, notificationId))
      .returning()
      .get();
    if (!updated) return NextResponse.json({ error: "Notifikasi tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ data: serializeNotification(updated), message: "Status notifikasi berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update notification", error);
    return NextResponse.json({ error: "Status notifikasi belum bisa diperbarui." }, { status: 500 });
  }
}
