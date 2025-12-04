"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "Vandaag" },
  { href: "/tour", label: "Tours" },
  { href: "/game", label: "Games" },
  { href: "/focus", label: "Focus" },
  { href: "/series", label: "Reeksen" },
  { href: "/live", label: "Live" },
  { href: "/profile", label: "Profiel" },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <header className="flex items-center justify-between">
      <Link href="/today" className="text-2xl font-semibold tracking-tight">
        MuseaThuis
      </Link>
      <nav className="flex gap-4 text-sm">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href === "/today" && pathname === "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                "transition-colors" +
                (active
                  ? " text-amber-300"
                  : " text-slate-300 hover:text-amber-200")
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
