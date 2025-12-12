import Skeleton from "@/components/ui/Skeleton";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SKELETON */}
        <div className="mb-12 space-y-4">
            <Skeleton className="h-4 w-32 bg-museum-gold/20" /> {/* Breadcrumb */}
            <Skeleton className="h-16 w-3/4 md:w-1/2" /> {/* Titel */}
            <Skeleton className="h-6 w-full md:w-1/3" /> {/* Subtitel */}
        </div>

        {/* GRID SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-midnight-900 border border-white/5 rounded-2xl overflow-hidden h-full">
                    <Skeleton className="h-64 w-full" /> {/* Plaatje */}
                    <div className="p-8 space-y-4">
                        <Skeleton className="h-8 w-3/4" /> {/* Titel Kaart */}
                        <Skeleton className="h-4 w-full" /> {/* Tekst */}
                        <Skeleton className="h-4 w-2/3" /> {/* Tekst */}
                        <div className="pt-4 flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-6" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* SPINNER CENTER */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full">
                <Loader2 className="animate-spin text-museum-gold w-8 h-8" />
            </div>
        </div>

      </div>
    </div>
  );
}
