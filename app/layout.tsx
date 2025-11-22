import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "MuseaThuis",
  description: "Digitaal kunstplatform met dagelijkse tours, games en focus-modus."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <header className="mb-8 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-semibold tracking-tight">MuseaThuis</h1>
            <p className="text-sm text-slate-300">
              Basisproject voor dagelijkse tours, games en focus-modus.
            </p>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
