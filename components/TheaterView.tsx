import type { ReactNode } from "react";

export function TheaterView({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-slate-900/80 p-4 shadow-lg ring-1 ring-slate-800">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {meta && <p className="mt-1 text-sm text-slate-300">{meta}</p>}
      </div>
      <div className="aspect-video w-full rounded-xl bg-slate-800/70 mb-4" />
      {children}
    </section>
  );
}
