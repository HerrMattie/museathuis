import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- CRUCIAAL: Dit koppelt stap 1

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MuseaThuis",
  description: "Kunst voor iedereen, gewoon thuis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        {/* Hier kunnen we later een Navbar toevoegen die ALTIJD zichtbaar is */}
        {children}
      </body>
    </html>
  );
}
