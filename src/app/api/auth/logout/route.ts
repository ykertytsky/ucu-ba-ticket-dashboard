import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { HELP_DESK_GATE_COOKIE } from "@/lib/gate-session";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  const url = new URL("/login", request.url);
  const res = NextResponse.redirect(url);
  res.cookies.set(HELP_DESK_GATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
