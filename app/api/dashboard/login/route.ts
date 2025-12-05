import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string") {
    return NextResponse.json(
      { error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  const secret = process.env.DASHBOARD_PASSWORD;

  if (!secret) {
    return NextResponse.json(
      { error: "NO_PASSWORD_CONFIGURED" },
      { status: 500 }
    );
  }

  if (password !== secret) {
    return NextResponse.json(
      { error: "INVALID_PASSWORD" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  response.headers.append(
    "Set-Cookie",
    `dashboard_auth=${encodeURIComponent(secret)}; Path=/; HttpOnly; SameSite=Strict; Secure`
  );

  return response;
}