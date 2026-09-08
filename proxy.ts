import { NextRequest, NextResponse } from "next/server";
import { readDemoSession } from "./lib/auth/session";
import { readAuthSession } from "./lib/auth/token";

const protectedRoots = [
  "/",
  "/admin",
  "/studio",
  "/guests",
  "/share",
  "/profile",
];

function isProtectedPath(pathname: string) {
  return protectedRoots.some((root) =>
    root === "/"
      ? pathname === "/"
      : pathname === root || pathname.startsWith(`${root}/`),
  );
}

export async function proxy(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) return NextResponse.next();

  const demoSession = readDemoSession(request.cookies);
  const authSession = await readAuthSession(request);
  const isAuthenticated = demoSession.isAuthenticated || Boolean(authSession);
  const isAdmin = demoSession.isAdmin || authSession?.user.role === "admin";
  const isBlocked =
    demoSession.isBlocked || authSession?.user.status === "blocked";
  if (isBlocked) {
    const blockedUrl = new URL("/login", request.url);
    blockedUrl.searchParams.set("blocked", "1");
    return NextResponse.redirect(blockedUrl);
  }
  if (
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/")
  ) {
    if (isAuthenticated && isAdmin) return NextResponse.next();
    if (isAuthenticated)
      return NextResponse.redirect(new URL("/?admin=required", request.url));
  } else if (isAuthenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
