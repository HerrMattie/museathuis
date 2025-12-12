import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-midnight-950 text-white flex items-center justify-center p-6 text-center">
      <div className="max-w-lg">
        
        {/* Icoon of Afbeelding */}
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
            <Search size={40} className="text-museum-gold opacity-80" />
        </div>

        <h1 className="text-5xl font-serif font-black mb-4 text-white">404</h1>
        <h2 className="text-2xl font-bold mb-4 text-gray-200">Dit kunstwerk is spoorloos</h2>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          Het lijkt erop dat de pagina die u zoekt is verplaatst, verwijderd, of nooit heeft bestaan. Misschien is hij uitgeleend aan een ander museum?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-museum-gold text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors">
                <Home size={18}/> Naar de Lobby
            </Link>
            <Link href="/tour" className="border border-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                <ArrowLeft size={18}/> Bekijk Audiotours
            </Link>
        </div>

      </div>
    </div>
  );
}
