import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 px-4 py-6 text-xs text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="max-w-xl">
          MuseaThuis is een onafhankelijke online kunstomgeving. In een volgende
          fase voegen wij hier links toe naar een compacte privacyverklaring en
          informatie over datagebruik.
        </p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/premium" className="hover:text-amber-300">
            Premium
          </Link>
          <Link href="/best-of" className="hover:text-amber-300">
            Best of MuseaThuis
          </Link>
          <Link href="/profile" className="hover:text-amber-300">
            Mijn profiel
          </Link>
        </nav>
      </div>
    </footer>
  );
}
