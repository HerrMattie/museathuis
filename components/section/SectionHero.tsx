// components/section/SectionHero.tsx
interface SectionHeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export function SectionHero({ title, subtitle, description }: SectionHeroProps) {
  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="relative h-40 sm:h-52 md:h-60">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.18),_transparent_55%)] opacity-70" />
        <div className="relative flex h-full flex-col justify-end px-5 pb-5">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-300">
            {subtitle}
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-50">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
