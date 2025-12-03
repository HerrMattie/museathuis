import React from "react";
import "./globals.css";

export const metadata = {
  title: "MuseaThuis",
  description: "Dagelijkse kunstervaring thuis"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">MuseaThuis</h1>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:underline">Vandaag</a>
              <a href="/tour" className="hover:underline">Tours</a>
              <a href="/game" className="hover:underline">Games</a>
              <a href="/focus" className="hover:underline">Focus</a>
              <a href="/dashboard/crm" className="hover:underline">CRM</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
