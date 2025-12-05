import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <div className="font-semibold text-slate-100">MuseaThuis</div>
          <div className="text-xs">
            Digitale museumervaring voor thuis. Inhoudelijk rijk en datagedreven.
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
          <Link href="/premium" className="hover:text-amber-300">
            Premium
          </Link>
          <Link href="#" className="hover:text-amber-300">
            Over MuseaThuis
          </Link>
          <Link href="#" className="hover:text-amber-300">
            Veelgestelde vragen
          </Link>
          <Link href="#" className="hover:text-amber-300">
            Privacy en cookies
          </Link>
          <Link href="#" className="hover:text-amber-300">
            Contact
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-900 py-3 text-center text-xs text-slate-500">
        Wij delen geen individuele profielen met musea, alleen geaggregeerde inzichten.
      </div>
    </footer>
  );
}
