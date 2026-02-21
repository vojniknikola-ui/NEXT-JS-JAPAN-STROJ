import { NextResponse } from "next/server";

export function middleware() {
  // No authentication required - allow all access
  return NextResponse.next();
}
