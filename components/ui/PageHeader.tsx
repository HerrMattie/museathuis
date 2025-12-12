import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    parentLink?: string; // Bijv: '/tour'
    parentLabel?: string; // Bijv: 'Terug naar Tours'
    backgroundImage?: string;
    center?: boolean;
}

export default function PageHeader({ title, subtitle, parentLink, parentLabel, backgroundImage, center = false }: PageHeaderProps) {
    return (
        <div className="relative pt-32 pb-16 px-6 border-b border-white/10 mb-12 overflow-hidden">
            {/* Achtergrond (Optioneel) */}
            {backgroundImage && (
                <>
                    <div className="absolute inset-0 z-0">
                        <img src={backgroundImage} className="w-full h-full object-cover opacity-30 blur-sm scale-105" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/80 via-midnight-950/90 to-midnight-950 z-0"></div>
                </>
            )}

            <div className={`relative z-10 max-w-7xl mx-auto ${center ? 'text-center' : ''}`}>
                {parentLink && (
                    <Link href={parentLink} className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-museum-gold hover:text-white mb-6 transition-colors ${center ? 'justify-center' : ''}`}>
                        <ArrowLeft size={14}/> {parentLabel || 'Terug'}
                    </Link>
                )}
                
                <h1 className="text-4xl md:text-6xl font-serif font-black text-white mb-4 drop-shadow-lg">
                    {title}
                </h1>
                
                {subtitle && (
                    <p className={`text-lg text-gray-300 max-w-2xl leading-relaxed ${center ? 'mx-auto' : ''}`}>
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
