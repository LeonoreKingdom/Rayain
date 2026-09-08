import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { invitations } from "../../../../../lib/db/schema";

export const runtime = "nodejs";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_DIRECTORY = join(process.cwd(), "public", "uploads", "invitations");
const PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function readDesignData(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const invitationId = id.trim();
  if (!invitationId) return Response.json({ error: "ID undangan wajib diisi." }, { status: 400 });

  const invitation = db.select().from(invitations).where(eq(invitations.id, invitationId)).get();
  if (!invitation) return Response.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Body request harus berupa multipart/form-data." }, { status: 400 });
  }

  const file = formData.get("file") ?? formData.get("photo");
  if (!(file instanceof File)) {
    return Response.json({ error: "Kirim file foto pada field file." }, { status: 400 });
  }
  if (!(file.type in PHOTO_TYPES)) {
    return Response.json({ error: "Format foto harus JPG, PNG, atau WebP." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) {
    return Response.json({ error: "Ukuran foto harus lebih dari 0 dan maksimal 5 MB." }, { status: 400 });
  }

  const extension = PHOTO_TYPES[file.type as keyof typeof PHOTO_TYPES];
  const filename = `${randomUUID()}.${extension}`;
  const publicPath = `/uploads/invitations/${filename}`;
  const targetPath = join(PHOTO_DIRECTORY, filename);

  try {
    await mkdir(PHOTO_DIRECTORY, { recursive: true });
    await writeFile(targetPath, Buffer.from(await file.arrayBuffer()), { flag: "wx" });

    const designData = {
      ...readDesignData(invitation.designData),
      photo: "custom",
      photoUrl: publicPath,
    };
    const updated = db
      .update(invitations)
      .set({ photo: "custom", designData: JSON.stringify(designData), updatedAt: new Date() })
      .where(eq(invitations.id, invitationId))
      .returning({ id: invitations.id, designData: invitations.designData })
      .get();

    if (!updated) {
      await unlink(targetPath).catch(() => undefined);
      return Response.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    }

    return Response.json({
      data: { invitationId: updated.id, url: publicPath, filename, contentType: file.type, size: file.size },
    }, { status: 201 });
  } catch (error) {
    await unlink(targetPath).catch(() => undefined);
    console.error("Failed to upload invitation photo", error);
    return Response.json({ error: "Foto belum bisa diunggah." }, { status: 500 });
  }
}
