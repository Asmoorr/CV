import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/ru", request.url));
}

export const config = {
  matcher: ["/"],
};
