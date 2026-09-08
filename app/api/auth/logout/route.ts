import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, revokeAuthSession } from "../../../../lib/auth/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(request: NextRequest) {
  revokeAuthSession(request);
  const response = NextResponse.json({ message: "Sesi berhasil diakhiri." });
  clearAuthCookie(response);
  return response;
}
