import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Chưa đăng nhập thì mọi trang bên trong quay về trang tham gia (kèm đường dẫn muốn vào).
 * Đã đăng nhập mà mở trang tham gia thì vào thẳng Cộng đồng.
 */
export function proxy(request: NextRequest) {
  const signedIn = request.cookies.has(SESSION_COOKIE);
  const { pathname, search } = request.nextUrl;

  if (pathname === "/") {
    return signedIn ? NextResponse.redirect(new URL("/community", request.url)) : NextResponse.next();
  }

  if (!signedIn) {
    const url = new URL("/", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/community/:path*",
    "/explore/:path*",
    "/new/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/u/:path*",
    "/p/:path*",
    "/groups/:path*",
    "/events/:path*",
    "/settings/:path*",
  ],
};
