import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db";
import { resetTokens, type ResetToken } from "../db/schema";

export const resetTokenMaxAge = 30 * 60;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const now = new Date();
  await db.update(resetTokens)
    .set({ usedAt: now })
    .where(and(eq(resetTokens.userId, userId), isNull(resetTokens.usedAt)))
    .run();

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + resetTokenMaxAge * 1000);
  await db.insert(resetTokens)
    .values({
      id: randomUUID(),
      userId,
      tokenHash: hashResetToken(token),
      expiresAt,
    })
    .run();
  return { token, expiresAt };
}

export async function readValidPasswordResetToken(token: string): Promise<ResetToken | null> {
  return (
    await db
      .select()
      .from(resetTokens)
      .where(
        and(
          eq(resetTokens.tokenHash, hashResetToken(token)),
          isNull(resetTokens.usedAt),
          gt(resetTokens.expiresAt, new Date()),
        ),
      )
      .get() ?? null
  );
}
