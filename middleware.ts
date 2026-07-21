import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-session";

export async function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    req.nextUrl.pathname !== "/admin/login"
  ) {
    const token = req.cookies.get("admin_session")?.value;
    if (!token || !(await verifyAdminSessionToken(token))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
