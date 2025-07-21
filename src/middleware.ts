import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Handle static and public routes early
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // ✅ Allow explicitly public routes
  if (
    [
      "/",
      "/auth/login",
      "/auth/register",
      "/contact",
      "/privacy",
      "/terms",
      "/guest",
    ].includes(pathname)
  ) {
    return NextResponse.next();
  }

  // ✅ Retrieve JWT session token (from NextAuth)
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const userRole = request.cookies.get("userRole")?.value as
    | "buyer"
    | undefined;

  // 🔒 Protect only specific routes
  if (["/dashboard"].includes(pathname)) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
