import { notFound } from "next/navigation";
import TourTheater, { TourMeta, TourItem } from "@/components/tour/TourTheater";
import { supabaseServer } from "@/lib/supabaseClient";

type PageProps = {
  params: { id: string };
};

export const dynamic = "force-dynamic";

export default async function TourDetailPage({ params }: PageProps) {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("tours")
    .select(`
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
      user_hints,
      items
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const meta: TourMeta = {
    id: data.id,
    date: data.date ?? null,
    title: data.title ?? "Tour",
    intro: data.intro ?? null,
    isPremium: !!data.is_premium,
    status: data.status ?? null,
    theme: data.theme ?? null,
    subtitle: data.subtitle ?? null,
    shortDescription: data.short_description ?? null,
    durationMin: data.duration_min ?? null,
    experienceText: data.experience_text ?? null,
    closingText: data.closing_text ?? null,
    overviewIntro: data.overview_intro ?? null,
    detailIntro: data.detail_intro ?? null,
    userHints: data.user_hints ?? null,
  };

  const items: TourItem[] = Array.isArray(data.items)
    ? (data.items as TourItem[])
    : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <TourTheater meta={meta} items={items} />
    </div>
  );
}
