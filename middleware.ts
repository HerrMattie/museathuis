import { NextRequest, NextResponse } from "next/server";

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

// Alleen deze paden beveiligen
const PROTECTED_PREFIXES = ["/admin", "/crm"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Publieke routes: laat alles gewoon door
  const needsAuth = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!needsAuth) {
    return NextResponse.next();
  }

  // Als er geen credentials zijn ingesteld, gewoon doorlaten
  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASSWORD) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [user, password] = decoded.split(":");

      if (user === BASIC_AUTH_USER && password === BASIC_AUTH_PASSWORD) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="MuseaThuis Admin"',
    },
  });
}

// Middleware toepassen op alle routes, maar in de functie zelf filteren
export const config = {
  matcher: ["/:path*"],
};
