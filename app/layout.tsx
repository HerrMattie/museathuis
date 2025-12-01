import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "MuseaThuis",
  description: "Dagelijkse kunsttours en verdiepende verhalen, gewoon thuis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <header>
          <nav>
            <Link href="/">MuseaThuis</Link>
            <div className="right-links">
              <Link href="/tour/today">Tour van vandaag</Link>
              <Link href="/game">Game</Link>
              <Link href="/focus">Focus</Link>
              <Link href="/premium">Premium</Link>
              <Link href="/museums">Voor musea</Link>
              <Link href="/profile" className="login-link">
                Inloggen
              </Link>
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer>
          <div className="footer-inner">
            <span>© {new Date().getFullYear()} MuseaThuis</span>
            <span>Dagelijkse kunst, gewoon thuis.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
