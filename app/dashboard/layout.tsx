"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/dashboard/AdminGuard";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Overzicht" },
  { href: "/dashboard/dayprogram", label: "Dagprogramma" },
  { href: "/dashboard/crm", label: "Content & CRM" },
  { href: "/dashboard/analytics", label: "Analytics (preview)" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="grid min-h-[calc(100vh-80px)] grid-cols-[240px,1fr] border-t border-slate-800 bg-slate-950/90">
        <aside className="border-r border-slate-800 bg-slate-950/90 px-4 py-5">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              MuseaThuis
            </p>
            <p className="text-sm font-semibold text-slate-100">
              CRM dashboard
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Interne omgeving voor dagprogramma, inhoud en data.
            </p>
          </div>
          <nav className="space-y-1 text-sm">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center justify-between rounded-full px-3 py-2 transition-colors",
                    active
                      ? "bg-amber-400 text-slate-950"
                      : "text-slate-200 hover:bg-slate-900 hover:text-slate-50",
                  ].join(" ")}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="px-6 py-6">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
