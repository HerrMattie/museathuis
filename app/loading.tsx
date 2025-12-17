// app/loading.tsx
import { Brush } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-midnight-950 flex flex-col items-center justify-center z-50">
      <div className="relative">
        {/* Het schilderende kwastje animatie */}
        <Brush 
            size={48} 
            className="text-museum-gold animate-bounce" 
            style={{ animationDuration: '1s' }}
        />
      </div>
      <p className="mt-4 text-museum-gold/60 text-sm font-serif animate-pulse">
        Kunstwerk laden...
      </p>
    </div>
  );
}
