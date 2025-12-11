'use client';

import Link from 'next/link';
import { Headphones, Crosshair, Gamepad2, ArrowRight } from 'lucide-react';

export default function DailyGrid({ items }: { items: any }) {
    
    // Helper voor cards
    const Card = ({ title, type, icon: Icon, href, image, desc, color }: any) => (
        <Link href={href} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-midnight-900 h-full flex flex-col hover:border-museum-gold/50 transition-all hover:-translate-y-2 hover:shadow-2xl">
            
            {/* Image/Header Area */}
            <div className={`h-48 relative overflow-hidden ${!image ? color : 'bg-black'}`}>
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                ) : (
                    // Fallback als er geen plaatje is: Mooi gekleurd vlak met icoon
                    <div className="w-full h-full flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                        <Icon size={64} className="text-white"/>
                    </div>
                )}
                
                {/* Label */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2 border border-white/10 shadow-lg">
                    <Icon size={12} className="text-museum-gold"/> {type}
                </div>
            </div>
            
            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-museum-gold transition-colors line-clamp-1">
                    {title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                    {desc}
                </p>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors flex items-center gap-2">
                        Ga naar {type}s <ArrowRight size={14} className="text-museum-gold"/>
                    </span>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="container mx-auto px-6 -mt-20 relative z-20 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {items?.tour && (
                    <Card 
                        title={items.tour.title} 
                        type="Tour" 
                        icon={Headphones} 
                        href="/tour" 
                        desc={items.tour.intro}
                        color="bg-purple-900"
                        image={items.tour.hero_image_url}
                    />
                )}

                {items?.focus && (
                    <Card 
                        title={items.focus.title} 
                        type="Artikel" 
                        icon={Crosshair} 
                        href="/focus" 
                        desc={items.focus.intro}
                        color="bg-blue-900" // Gefixt: Was foutieve code string
                        // Focus heeft vaak geen hero_image_url in de root, dus fallback kleur is belangrijk
                    />
                )}

                {items?.game && (
                    <Card 
                        title={items.game.title} 
                        type="Game" 
                        icon={Gamepad2} 
                        href="/game" 
                        desc={items.game.short_description}
                        color="bg-emerald-900" // Gefixt: Was foutieve code string
                    />
                )}

            </div>
        </div>
    );
}
