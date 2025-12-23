import { Brush, Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-midnight-950 flex flex-col items-center justify-center z-50">
      <div className="relative">
        {/* Achtergrond gloed */}
        <div className="absolute inset-0 bg-museum-gold/20 blur-xl rounded-full animate-pulse" />
        
        {/* Het icoon */}
        <div className="relative bg-midnight-900 p-4 rounded-full border border-white/10 shadow-2xl">
            <Brush 
                size={32} 
                className="text-museum-gold animate-bounce" 
                style={{ animationDuration: '2s' }}
            />
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
          <h3 className="text-museum-gold font-serif text-xl tracking-wide">MuseaThuis</h3>
          <p className="text-gray-500 text-sm font-sans flex items-center gap-2 justify-center">
             <Loader2 size={12} className="animate-spin"/>
             Uw persoonlijke collectie samenstellen...
          </p>
      </div>
    </div>
  );
}
