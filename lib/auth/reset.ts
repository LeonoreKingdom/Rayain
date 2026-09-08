import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db";
import { resetTokens, type ResetToken } from "../db/schema";

export const resetTokenMaxAge = 30 * 60;

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetToken(userId: string) {
  const now = new Date();
  db.update(resetTokens)
    .set({ usedAt: now })
    .where(and(eq(resetTokens.userId, userId), isNull(resetTokens.usedAt)))
    .run();

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + resetTokenMaxAge * 1000);
  db.insert(resetTokens)
    .values({
      id: randomUUID(),
      userId,
      tokenHash: hashResetToken(token),
      expiresAt,
    })
    .run();
  return { token, expiresAt };
}

export function readValidPasswordResetToken(token: string): ResetToken | null {
  return (
    db
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
