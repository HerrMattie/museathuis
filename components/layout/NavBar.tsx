"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Vandaag" },
  { href: "/tour/today", label: "Tours" },
  { href: "/game", label: "Spellen" },
  { href: "/focus", label: "Focusmoment" },
  { href: "/salon", label: "Salon" },
  { href: "/academie", label: "Academie" },
  { href: "/best-of", label: "Best of" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          MuseaThuis
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "text-sm transition-colors",
                  active
                    ? "text-amber-400"
                    : "text-slate-200 hover:text-amber-300",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/premium"
            className="rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-300"
          >
            Premium
          </Link>
          <Link
            href="/profile"
            className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:border-amber-400"
          >
            Profiel
          </Link>
        </div>
      </nav>
    </header>
  );
}
