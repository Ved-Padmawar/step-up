import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/register"];
const passwordChangePath = "/change-password";

function mustChangePassword(authUser: unknown): boolean {
  if (!authUser || typeof authUser !== "object") {
    return false;
  }

  return "mustChangePassword" in authUser && authUser.mustChangePassword === true;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!request.auth;
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isPasswordChangePath = pathname.startsWith(passwordChangePath);
  const isAuthHandler = pathname.startsWith("/api/auth");
  const isChangePasswordApi = pathname === "/api/auth/change-password";
  const requiresPasswordChange = mustChangePassword(request.auth?.user);

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

  if (isLoggedIn && requiresPasswordChange) {
    if (!isPasswordChangePath && !isChangePasswordApi) {
      return NextResponse.redirect(
        new URL(passwordChangePath, request.nextUrl.origin),
      );
    }
    return NextResponse.next();
  }

  if (isLoggedIn && isPasswordChangePath) {
    return NextResponse.redirect(new URL("/activities", request.nextUrl.origin));
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
