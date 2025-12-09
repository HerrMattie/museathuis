import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/NavBar"; // We importeren de nieuwe component

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MuseaThuis",
  description: "Dagelijkse kunstbeleving van wereldklasse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-midnight-950 text-museum-text-primary antialiased selection:bg-museum-gold selection:text-black">
        
        {/* De nieuwe Navigatiebalk */}
        <NavBar />

        {/* Content met correcte padding voor de fixed header (80px = h-20) */}
        <div className="pt-24 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
