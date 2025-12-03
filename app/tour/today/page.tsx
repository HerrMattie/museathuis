import { createClient } from "@supabase/supabase-js";
import { TourTheater } from "@/components/TourTheater";

function getServiceClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function TodayTourPage() {
  const supabase = getServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: tour } = await supabase
    .from("tours")
    .select("id,title,intro")
    .eq("date", today)
    .maybeSingle();

  if (!tour?.id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-3">
        <h1 className="text-2xl font-semibold">Tour van vandaag</h1>
        <p className="text-sm text-neutral-700">
          Er is nog geen tour ingepland voor vandaag. Probeer later opnieuw of genereer
          een tour vanuit het CRM.
        </p>
      </div>
    );
  }

  const { data: items } = await supabase
    .from("tour_items")
    .select("position, ai_text, artworks ( id, title, artist, year_from, year_to, object_type, material, image_url )")
    .eq("tour_id", tour.id)
    .order("position", { ascending: true });

  const mappedItems = (items ?? []).map((it: any) => ({
    id: it.artworks.id as string,
    title: it.artworks.title as string,
    artist: it.artworks.artist as string | null,
    year_from: it.artworks.year_from as number | null,
    year_to: it.artworks.year_to as number | null,
    object_type: it.artworks.object_type as string | null,
    material: it.artworks.material as string | null,
    image_url: it.artworks.image_url as string | null,
    ai_text: it.ai_text as string | null
  }));

  return (
    <TourTheater
      tourTitle={tour.title ?? "Tour van vandaag"}
      tourIntro={tour.intro}
      items={mappedItems}
    />
  );
}
