import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/register"];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!request.auth;
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAuthHandler = pathname.startsWith("/api/auth");

  if (isAuthHandler) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/activities", request.nextUrl.origin));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/activities", request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
