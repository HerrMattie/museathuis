import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set({
    name: "dashboard_auth",
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}