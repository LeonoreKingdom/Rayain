import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, revokeAuthSession } from "../../../../lib/auth/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await revokeAuthSession(request);
  const response = NextResponse.json({ message: "Sesi berhasil diakhiri." });
  clearAuthCookie(response);
  return response;
}
