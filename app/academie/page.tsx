import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, BookOpen, Lock, ChevronRight } from 'lucide-react';

export const revalidate = 60;

export default async function AcademiePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  // Haal alle gepubliceerde cursussen op
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, short_description, hero_image_url, is_premium, duration_weeks, course_lessons(count)')
    .order('created_at', { ascending: false }); 

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <header className="mb-16 max-w-4xl border-b border-white/10 pb-8">
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Gestructureerde Leerlijnen
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">De Academie</h1>
          <p className="text-xl text-museum-text-secondary leading-relaxed max-w-3xl">
            Duik diep in een onderwerp. Onze cursussen zijn opgebouwd uit Focus-items om u een compleet historisch en technisch inzicht te geven.
          </p>
        </header>

        {/* CURSUSSEN GRID */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses?.map((course: any) => {
              const lessonCount = course.course_lessons?.[0]?.count || 0;
              const isLocked = course.is_premium && !isUserPremium;
              const linkUrl = isLocked ? '/pricing' : `/academie/${course.id}`;
              
              return (
                <Link key={course.id} href={linkUrl} className="group relative flex flex-col h-[450px] rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02]">
                  
                  {/* Background Image */}
                  {course.hero_image_url && (
                    <Image 
                      src={course.hero_image_url} 
                      alt={course.title} 
                      fill 
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-70' : 'opacity-90'}`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                    
                    {/* Meta Data */}
                    <div className="flex items-center gap-3 text-sm font-bold mb-3 text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> {course.duration_weeks} Wk
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={14} /> {lessonCount} Lessen
                      </span>
                    </div>

                    <h3 className="font-serif text-3xl text-white font-bold mb-2 drop-shadow-md">
                      {course.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                       {course.short_description}
                    </p>
                    
                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-bold text-museum-gold group-hover:text-museum-lime transition-colors">
                       {isLocked ? (
                          <>Ontgrendel Cursus <Lock size={16} /></>
                       ) : (
                          <>Start Cursus <ChevronRight size={16} /></>
                       )}
                    </div>
                  </div>
                </Link>
              );
            })}
            
            {courses?.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                   De Academie is nog in de opstartfase. Nieuwe cursussen volgen snel.
                </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
