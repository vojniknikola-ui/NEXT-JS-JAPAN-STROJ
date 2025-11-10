import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATH = "/admin";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith(ADMIN_PATH)) {
    const cookie = req.cookies.get("admin")?.value;
    if (cookie !== "1") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}