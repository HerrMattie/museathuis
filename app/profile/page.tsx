import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Heart, Trophy, Flame, Star, Zap, Award, Hexagon } from 'lucide-react';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-10 text-white">Log in om je profiel te zien.</div>;

  // 1. Haal alle data op
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
  const { data: favorites } = await supabase.from('favorites').select('*, artwork:artworks(image_url)').eq('user_id', user.id);
  const { data: earnedBadges } = await supabase.from('user_badges').select('badge_id, earned_at, badge:badges(*)').eq('user_id', user.id);
  const { data: allBadges } = await supabase.from('badges').select('*');

  // 2. Bereken voortgang naar volgend level
  const currentXP = profile?.xp || 0;
  const currentLevel = profile?.level || 1;
  const nextLevelXP = currentLevel * 1000;
  const progressPercent = Math.min((currentXP / nextLevelXP) * 100, 100);

  return (
    <main className="container mx-auto px-6 py-12 animate-fade-in-up pb-24">
      
      {/* HEADER MET LEVEL */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-16">
        {/* Avatar & Level Cirkel */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-midnight-800 bg-midnight-900 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
             <span className="text-4xl font-bold text-white">{user.email?.[0].toUpperCase()}</span>
          </div>
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-museum-gold text-black font-bold h-12 w-12 rounded-full flex items-center justify-center border-4 border-midnight-950 z-20 shadow-lg">
            {currentLevel}
          </div>
          {/* Circular Progress (Visueel effect) */}
          <div className="absolute inset-0 rounded-full border-4 border-museum-gold/30 -z-0 scale-110" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="font-serif text-4xl text-white font-bold mb-2">
            {user.user_metadata?.full_name || 'Kunstverzamelaar'}
          </h1>
          <p className="text-gray-400 mb-6">{user.email}</p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
            <div className="bg-midnight-900 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <Flame className="text-orange-500" size={20} />
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold">Streak</div>
                <div className="text-white font-bold">{profile?.current_streak || 0} Dagen</div>
              </div>
            </div>
            <div className="bg-midnight-900 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <Zap className="text-yellow-400" size={20} />
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold">XP</div>
                <div className="text-white font-bold">{currentXP} XP</div>
              </div>
            </div>
             <div className="bg-midnight-900 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
              <Trophy className="text-museum-gold" size={20} />
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold">Badges</div>
                <div className="text-white font-bold">{earnedBadges?.length || 0} / {allBadges?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Level {currentLevel}</span>
              <span>Level {currentLevel + 1}</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-museum-gold to-yellow-200" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">Nog {nextLevelXP - currentXP} XP te gaan</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
            <Link href="/pricing" className="px-6 py-3 bg-museum-gold text-black rounded-xl font-bold hover:bg-white transition-colors text-center shadow-lg">
               {profile?.is_premium ? 'Mecenas Status' : 'Word Mecenas'}
            </Link>
            <form action="/auth/signout" method="post">
             <button className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
               <LogOut size={16} /> Uitloggen
             </button>
           </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* KOLOM 1: BADGES & ACHIEVEMENTS */}
        <div>
          <h2 className="font-serif text-2xl text-white font-bold mb-6 flex items-center gap-2">
            <Award className="text-museum-gold" /> Prestaties
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {allBadges?.map((badge) => {
              const isEarned = earnedBadges?.find((eb: any) => eb.badge_id === badge.id);
              
              return (
                <div key={badge.id} className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${isEarned ? 'bg-museum-gold/10 border-museum-gold/30' : 'bg-midnight-900 border-white/5 opacity-50 grayscale'}`}>
                  <div className={`mb-3 p-3 rounded-full ${isEarned ? 'bg-museum-gold text-black shadow-lg shadow-museum-gold/20' : 'bg-white/5 text-gray-500'}`}>
                    {badge.icon_name === 'Flame' && <Flame size={20} />}
                    {badge.icon_name === 'Star' && <Star size={20} />}
                    {badge.icon_name === 'Heart' && <Heart size={20} />}
                    {badge.icon_name === 'Award' && <Award size={20} />}
                    {!['Flame','Star','Heart','Award'].includes(badge.icon_name) && <Hexagon size={20} />}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{badge.name}</h3>
                  <p className="text-[10px] text-gray-400 leading-tight">{badge.description}</p>
                  {isEarned && <span className="mt-2 text-[10px] text-museum-gold font-bold uppercase tracking-wider">Behaald</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* KOLOM 2: COLLECTIE */}
        <div>
          <h2 className="font-serif text-2xl text-white font-bold mb-6 flex items-center gap-2">
            <Heart className="text-red-500 fill-current" /> Mijn Collectie
          </h2>
          
          {favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {favorites.slice(0, 6).map((fav: any) => (
                <div key={fav.id} className="group relative aspect-square bg-midnight-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all">
                  <Image src={fav.artwork.image_url} alt="art" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              ))}
              {favorites.length > 6 && (
                <div className="aspect-square bg-midnight-900 rounded-xl border border-white/5 flex items-center justify-center text-gray-500 text-sm">
                  +{favorites.length - 6} meer
                </div>
              )}
            </div>
          ) : (
             <div className="p-8 bg-white/5 border border-white/5 rounded-xl text-center">
               <p className="text-gray-400 text-sm">Verzamel je eerste kunstwerk.</p>
             </div>
          )}
        </div>

      </div>
    </main>
  );
}
