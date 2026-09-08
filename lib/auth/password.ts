import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const keyLength = 64;
const saltLength = 16;

export function hashPassword(password: string) {
  const salt = randomBytes(saltLength).toString("hex");
  const hash = scryptSync(password, salt, keyLength).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [algorithm, salt, expectedHash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHash) return false;

  try {
    const actualHash = scryptSync(password, salt, keyLength);
    const expected = Buffer.from(expectedHash, "hex");
    return (
      expected.length === actualHash.length &&
      timingSafeEqual(actualHash, expected)
    );
  } catch {
    return false;
  }
}
