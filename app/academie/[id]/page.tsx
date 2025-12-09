import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ChevronRight, BookOpen, Clock, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import PremiumLock from '@/components/common/PremiumLock'; // Hergebruik de lock component

export const revalidate = 3600;

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal de cursus op
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!course) return notFound();

  // 2. Haal de lessen (Focus Items) op in de juiste volgorde
  const { data: lessons } = await supabase
    .from('course_lessons')
    .select(`
      lesson_order,
      focus_item:focus_items(id, title, intro, is_premium)
    `)
    .eq('course_id', course.id)
    .order('lesson_order');

  // 3. Premium Check
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }
  const isLocked = course.is_premium && !isUserPremium;

  return (
    <PremiumLock isLocked={isLocked}>
      <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
        <div className="container mx-auto px-6">
          
          <Link href="/academie" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm font-medium">
            <ChevronRight className="rotate-180" size={16} /> Terug naar Academie Overzicht
          </Link>

          {/* CURSUS HEADER */}
          <header className="mb-12 max-w-4xl">
            <p className="text-museum-gold text-sm font-bold uppercase tracking-widest mb-2">CURSUS</p>
            <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-museum-text-secondary leading-relaxed mb-6">
              {course.short_description}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2"><Clock size={16} /> {course.duration_weeks} Weken</span>
              <span className="flex items-center gap-2"><BookOpen size={16} /> {lessons?.length || 0} Lessen</span>
              {course.is_premium && <span className="text-museum-gold font-bold">PREMIUM LEERLIJN</span>}
            </div>
          </header>

          {/* INHOUDSOPGAVE (Lessen) */}
          <section className="max-w-4xl">
            <h2 className="font-serif text-3xl text-white font-bold mb-6 border-b border-white/10 pb-2">Inhoudsopgave</h2>
            
            <div className="space-y-4">
              {lessons?.map((lesson: any, index: number) => (
                <Link 
                  key={lesson.focus_item.id} 
                  // Linkt naar de bestaande Focus Item pagina
                  href={`/focus/${lesson.focus_item.id}`} 
                  className="group flex items-center p-5 bg-midnight-900 rounded-xl border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="flex-none w-10 h-10 rounded-full bg-museum-lime flex items-center justify-center text-black font-bold mr-6">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">Les {index + 1}</p>
                    <h3 className="font-bold text-lg text-white group-hover:text-museum-gold transition-colors">
                      {lesson.focus_item.title}
                    </h3>
                  </div>
                  <ChevronRight size={20} className="text-gray-500 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>

            {lessons?.length === 0 && (
              <p className="text-gray-500 py-10 text-center border border-dashed border-white/10 rounded-xl">Deze cursus is nog in aanbouw.</p>
            )}
          </section>

        </div>
      </main>
    </PremiumLock>
  );
}
