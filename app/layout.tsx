import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; 
import "./globals.css";

// HIER ZIT DE FIX: We verwijzen nu naar de map 'layout'
import Header from "@/components/layout/Header"; 
import Footer from "@/components/layout/Footer"; 

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif" 
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
      <body className="bg-midnight-950 text-slate-200 font-sans antialiased flex flex-col min-h-screen selection:bg-museum-gold selection:text-black">
        
        <Header />
        
        <main className="flex-1 flex flex-col pt-20"> 
          {children}
        </main>

        <Footer />
        
      </body>
    </html>
  );
}
