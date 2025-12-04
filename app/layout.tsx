import "./globals.css";
import type { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";

export const metadata = {
  title: "MuseaThuis",
  description: "Dagelijkse tours, games en focus voor kunstliefhebbers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <NavBar />
          <main className="mt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
