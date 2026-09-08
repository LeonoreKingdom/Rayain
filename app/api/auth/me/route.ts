import { type NextRequest, NextResponse } from "next/server";
import { readAuthSession } from "../../../../lib/auth/token";
import { serializeUser } from "../../../../lib/users/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const authenticated = readAuthSession(request);
  if (!authenticated)
    return NextResponse.json(
      { error: "Sesi autentikasi diperlukan." },
      { status: 401 },
    );
  if (authenticated.user.status === "blocked")
    return NextResponse.json(
      { error: "Akun pengguna sedang diblokir." },
      { status: 403 },
    );
  return NextResponse.json({
    data: serializeUser(authenticated.user),
    session: { expiresAt: authenticated.session.expiresAt.toISOString() },
  });
}
