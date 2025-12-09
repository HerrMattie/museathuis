'use client';
import { Lock } from 'lucide-react';
import Link from 'next/link';

type PremiumLockProps = {
  isLocked: boolean;
  children: React.ReactNode;
};

export default function PremiumLock({ isLocked, children }: PremiumLockProps) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {/* De Content (Wazig gemaakt) */}
      <div className="filter blur-md pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* De Overlay (Het Slot) */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="bg-midnight-900 border border-museum-gold p-6 rounded-2xl text-center shadow-2xl max-w-sm mx-4">
          <div className="mx-auto w-12 h-12 bg-museum-gold rounded-full flex items-center justify-center mb-4 text-black">
            <Lock size={24} />
          </div>
          <h3 className="text-xl font-serif font-bold text-white mb-2">Premium Content</h3>
          <p className="text-gray-400 text-sm mb-6">
            Deze tour is exclusief beschikbaar voor onze Mecenas leden.
          </p>
          <Link 
            href="/pricing" 
            className="block w-full py-3 bg-museum-gold text-black font-bold rounded-lg hover:bg-white transition-colors"
          >
            Bekijk Abonnementen
          </Link>
        </div>
      </div>
    </div>
  );
}
