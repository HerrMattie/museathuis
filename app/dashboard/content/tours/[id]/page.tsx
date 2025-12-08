import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseClient";
import TourEditForm, {
  CmsTour,
} from "@/components/crm/TourEditForm";

type PageProps = {
  params: { id: string };
};

export const dynamic = "force-dynamic";

export default async function TourEditPage({ params }: PageProps) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("tours")
    .select(
      `
      id,
      date,
      title,
      intro,
      is_premium,
      status,
      theme,
      subtitle,
      short_description,
      duration_min,
      experience_text,
      closing_text,
      overview_intro,
      detail_intro,
      user_hints
    `
    )
    .eq("id", params.id)
    .maybeSingle<CmsTour>();

  if (error || !data) {
    console.error("CRM tour load error", error);
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
          Content &amp; CRM
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50">
          Tour bewerken
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Pas hier titel, metadata en begeleidende teksten aan. De wijzigingen
          zijn direct zichtbaar op de tourpagina en in de overlay.
        </p>
      </div>

      <TourEditForm initialTour={data} />
    </div>
  );
}
