import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/NavBar";
import type { Metadata } from 'next';

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

// DE GLOBALE SEO CONFIGURATIE
export const metadata: Metadata = {
  title: {
    template: '%s | MuseaThuis',
    default: 'MuseaThuis - Dagelijkse Kunstbeleving',
  },
  description: "Elke dag een nieuwe audiotour, een verdiepend focusmoment en een speelse quiz. Samengesteld door AI, gecureerd voor u.",
  metadataBase: new URL('https://museathuis.vercel.app'), // Pas dit later aan naar je echte domein!
  openGraph: {
    title: 'MuseaThuis',
    description: 'Het museum komt naar u toe.',
    url: '/',
    siteName: 'MuseaThuis',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=1200', // Algemeen deel-plaatje
        width: 1200,
        height: 630,
      },
    ],
    locale: 'nl_NL',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased pt-20 selection:bg-museum-gold selection:text-black bg-midnight-950">
        <NavBar user={user} />
        {children}
      </body>
    </html>
  );
}
