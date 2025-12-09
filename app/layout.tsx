import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Check hier alvast of de gebruiker is ingelogd
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased pt-20 selection:bg-museum-gold selection:text-black bg-midnight-950">
        {/* We geven de 'user' mee aan de NavBar */}
        <NavBar user={user} />
        {children}
      </body>
    </html>
  );
}
