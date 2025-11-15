import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // No authentication required - allow all access
  return NextResponse.next();
}