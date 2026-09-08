import { type NextRequest, NextResponse } from "next/server";
import { readDemoSession, type DemoSession } from "./session";

export function authorizeAdmin(request: NextRequest): { session: DemoSession } | { response: NextResponse } {
  const session = readDemoSession(request.cookies);
  if (!session.isAuthenticated) return { response: NextResponse.json({ error: "Sesi admin diperlukan." }, { status: 401 }) };
  if (session.isBlocked) return { response: NextResponse.json({ error: "Akun pengguna sedang diblokir." }, { status: 403 }) };
  if (!session.isAdmin) return { response: NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 }) };
  return { session };
}
