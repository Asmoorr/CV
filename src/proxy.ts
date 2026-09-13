import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") return NextResponse.redirect(new URL("/ru", request.url));
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-resume-locale", pathname.startsWith("/en") ? "en" : "ru");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/(ru|en)/:path*"],
};
