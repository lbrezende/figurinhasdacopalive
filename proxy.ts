import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proxy leve (antigo "middleware"): NÃO importa Auth.js (que puxaria Prisma+
// providers e estouraria o limite de 1MB de Edge Function). Só checa o cookie.
const PROTECTED = ["/app", "/dashboard", "/settings"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/settings/:path*"],
};
