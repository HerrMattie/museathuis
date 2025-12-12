import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/ui/BottomNav";
import Sidebar from "@/components/crm/Sidebar"; // Als je die hebt voor desktop

// Fonts laden
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-serif',
});

const lato = Lato({ 
  subsets: ["latin"], 
  weight: ["300", "400", "700", "900"],
  variable: '--font-sans',
});

// Metadata voor SEO & PWA
// ... imports ...

export const metadata: Metadata = {
  metadataBase: new URL('https://museathuis.nl'), // Belangrijk voor relatieve plaatjes!
  title: {
    default: 'MuseaThuis | Jouw dagelijkse dosis kunst',
    template: '%s | MuseaThuis', // Zorgt voor titels als "De Nachtwacht | MuseaThuis"
  },
  description: 'Ontdek interactieve audiotours, games en verdiepende verhalen vanuit je woonkamer. Elke dag een nieuwe collectie.',
  keywords: ['kunst', 'museum', 'audiotour', 'geschiedenis', 'educatie', 'thuismuseum', 'rijksmuseum', 'van gogh'],
  authors: [{ name: 'MuseaThuis Team' }],
  creator: 'MuseaThuis',
  
  // PWA instellingen
  manifest: "/manifest.json",
  
  // Social Media (Open Graph)
  openGraph: {
    title: 'MuseaThuis | Jouw dagelijkse dosis kunst',
    description: 'Ontdek interactieve audiotours, games en verdiepende verhalen.',
    url: 'https://museathuis.nl',
    siteName: 'MuseaThuis',
    images: [
      {
        url: '/og-image.jpg', // Zorg voor een mooi plaatje (1200x630px) in je public map!
        width: 1200,
        height: 630,
        alt: 'MuseaThuis Preview',
      },
    ],
    locale: 'nl_NL',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'MuseaThuis',
    description: 'Breng het museum naar je woonkamer.',
    images: ['/og-image.jpg'],
  },
};

// ... rest van de layout ...

// Viewport settings (belangrijk voor mobiel: voorkomt inzoomen bij input)
export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${playfair.variable} ${lato.variable}`}>
      <body className="bg-midnight-950 text-white antialiased font-sans pb-16 md:pb-0">
        
        {/* DESKTOP: Sidebar (Alleen zichtbaar op grote schermen via CSS in Sidebar component) */}
        {/* Zorg dat in Sidebar.tsx staat: className="... hidden md:block" */}
        <div className="hidden md:block">
            {/* Hier zou je Sidebar component kunnen renderen als je die globaal wilt */}
        </div>

        {/* MAIN CONTENT */}
        <main className="min-h-screen">
            {children}
        </main>

        {/* MOBIEL: Bottom Navigation (Alleen zichtbaar op kleine schermen) */}
        <BottomNav />
        
      </body>
    </html>
  );
}
