import Link from 'next/link';
import { Headphones, Crosshair, Gamepad2, Brush, ArrowUpRight } from 'lucide-react';

export default function DailyGrid({ items }: { items: any }) {
    
    // Helper voor cards
    const Card = ({ title, type, icon: Icon, href, image, desc, color }: any) => (
        <Link href={href} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-midnight-900 h-full flex flex-col hover:border-white/30 transition-all hover:-translate-y-1 hover:shadow-2xl">
            {/* Image/Header Area */}
            <div className={`h-48 relative overflow-hidden ${!image ? color : ''}`}>
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20"><Icon size={64}/></div>
                )}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 border border-white/10">
                    <Icon size={12}/> {type}
                </div>
            </div>
            
            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-serif font-bold text-white mb-2 group-hover:text-museum-gold transition-colors">{title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">{desc}</p>
                
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors mt-auto">
                    Bekijken <ArrowUpRight size={14}/>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="container mx-auto px-6 -mt-20 relative z-20 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {items.tour && (
                    <Card 
                        title={items.tour.title} 
                        type="Audio Tour" 
                        icon={Headphones} 
                        href={`/tour/${items.tour.id}`}
                        desc={items.tour.intro}
                        color="bg-purple-900"
                        image={items.tour.hero_image_url} // Als je die hebt
                    />
                )}

                {items.focus && (
                    <Card 
                        title={items.focus.title} 
                        type="Focus" 
                        icon={Crosshair} 
                        href={`/focus/${items.focus.id}`}
                        desc={items.focus.intro}
                        color="bg-blue-900"
                    />
                )}

                {items.game && (
                    <Card 
                        title={items.game.title} 
                        type="Quiz" 
                        icon={Gamepad2} 
                        href={`/game/${items.game.id}`}
                        desc={items.game.short_description}
                        color="bg-emerald-900"
                    />
                )}

                {items.salon && (
                    <Card 
                        title={items.salon.title} 
                        type="Salon" 
                        icon={Brush} 
                        href={`/salon/${items.salon.id}`}
                        desc={items.salon.short_description}
                        color="bg-orange-900"
                    />
                )}

            </div>
        </div>
    );
}
