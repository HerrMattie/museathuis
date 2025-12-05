import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const secret = process.env.DASHBOARD_PASSWORD;

  if (!secret) {
    // Geen wachtwoord geconfigureerd: laat dashboard open.
    return <>{children}</>;
  }

  const authCookie = cookieStore.get("dashboard_auth")?.value;

  if (authCookie !== secret) {
    redirect("/dashboard/login");
  }

  return <>{children}</>;
}