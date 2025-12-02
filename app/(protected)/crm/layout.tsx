// app/(protected)/crm/layout.tsx
import type { ReactNode } from "react";

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-neutral-950 text-neutral-50">
        <div className="flex min-h-screen">
          <aside className="w-64 border-r border-neutral-800 bg-neutral-950">
            <div className="px-4 py-4 text-sm font-semibold">MuseaThuis CRM</div>
            <nav className="space-y-1 px-2 text-sm">
              <a href="/crm/tours" className="block rounded px-2 py-1 hover:bg-neutral-800">
                Tours
              </a>
              <a href="/crm/artworks" className="block rounded px-2 py-1 hover:bg-neutral-800">
                Kunstwerken
              </a>
              <a href="/crm/analytics" className="block rounded px-2 py-1 hover:bg-neutral-800">
                Analytics
              </a>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="border-b border-neutral-800 px-4 py-3 text-sm text-neutral-300">
              Beheer je tours, planning en content
            </div>
            <div className="px-4 py-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
