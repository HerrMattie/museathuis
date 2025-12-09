import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";

// Configureer Google Fonts
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

export const metadata = {
  title: "MuseaThuis",
  description: "Dagelijkse kunstbeleving van wereldklasse.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased pt-20 selection:bg-museum-gold selection:text-black bg-midnight-950">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
