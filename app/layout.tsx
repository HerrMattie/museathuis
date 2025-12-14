import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; 
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 1. We gebruiken nu Inter (voor leesbare tekst) en Playfair Display (voor titels)
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif" // We noemen hem intern 'serif'
});

export const metadata: Metadata = {
  title: "MuseaThuis | Jouw dagelijkse kunst dosis",
  description: "Ontdek elke dag nieuwe kunstwerken.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      {/* 2. De body krijgt flex-col om de footer naar beneden te duwen */}
      <body className="bg-midnight-950 text-slate-200 font-sans antialiased flex flex-col min-h-screen selection:bg-museum-gold selection:text-black">
        
        {/* HEADER: Moet bovenaan staan */}
        <Header />
        
        {/* MAIN: Vult de ruimte */}
        <main className="flex-1 flex flex-col pt-20"> 
          {/* pt-20 zorgt dat de inhoud niet ONDER de header verdwijnt */}
          {children}
        </main>

        {/* FOOTER: Moet onderaan staan */}
        <Footer />
        
      </body>
    </html>
  );
}
