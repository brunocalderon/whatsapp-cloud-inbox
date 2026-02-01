import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const basicAuthUser = process.env.BASIC_AUTH_USER;
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

  // Skip auth if credentials are not configured
  if (!basicAuthUser || !basicAuthPassword) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area", charset="UTF-8"',
      },
    });
  }

  const base64Credentials = authHeader.slice(6);
  let decoded: string;
  try {
    decoded = atob(base64Credentials);
  } catch {
    return new NextResponse("Invalid authorization", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area", charset="UTF-8"',
      },
    });
  }

  const [user, password] = decoded.split(":", 2);
  if (user !== basicAuthUser || password !== basicAuthPassword) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area", charset="UTF-8"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder (svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
