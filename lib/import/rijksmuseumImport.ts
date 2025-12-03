import { createClient } from "@supabase/supabase-js";

/**
 * Eenvoudige server-side Supabase client voor import-taken.
 * Verwacht SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY als environment variables.
 */
function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

type RijksArtObject = {
  id: string;
  objectNumber: string;
  title: string;
  principalOrFirstMaker?: string;
  webImage?: {
    url?: string;
    width?: number;
    height?: number;
  };
  dating?: {
    yearEarly?: number;
    yearLate?: number;
  };
  objectTypes?: string[];
  materials?: string[];
  techniques?: string[];
};

async function fetchRijksPage(page: number, pageSize: number = 100): Promise<RijksArtObject[]> {
  const apiKey = process.env.RIJKSMUSEUM_API_KEY;
  if (!apiKey) {
    throw new Error("RIJKSMUSEUM_API_KEY ontbreekt");
  }

  const url = new URL("https://www.rijksmuseum.nl/api/nl/collection");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("ps", String(pageSize));
  url.searchParams.set("p", String(page));
  url.searchParams.set("imgonly", "true");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Rijksmuseum API fout (status ${res.status})`);
  }

  const data = await res.json();
  return (data.artObjects ?? []) as RijksArtObject[];
}

/**
 * Basis kwaliteitsfilter volgens jouw wensen:
 *  - goede resolutie
 *  - titel + kunstenaar aanwezig
 */
function mapAndFilterRijksObject(obj: RijksArtObject) {
  if (!obj.webImage?.url) return null;
  const width = obj.webImage.width ?? 0;
  if (width < 2500) return null;

  if (!obj.title) return null;
  if (!obj.principalOrFirstMaker) return null;

  return {
    source_id: obj.objectNumber,
    title: obj.title,
    artist: obj.principalOrFirstMaker,
    image_url: obj.webImage.url,
    image_width: obj.webImage.width ?? null,
    image_height: obj.webImage.height ?? null,
    year_from: obj.dating?.yearEarly ?? null,
    year_to: obj.dating?.yearLate ?? null,
    object_type: obj.objectTypes?.[0] ?? null,
    material: obj.materials?.join(", ") ?? null,
    dimensions: null,
    rights: null,
    quality_score: 1.0
  };
}

/**
 * Start een import-run voor 1 museum (Rijksmuseum) en sla top-werken op.
 * Dit is 80/20: we halen een beperkt aantal pagina's op, maar de code is
 * eenvoudig uit te breiden (meer pagina's, andere musea).
 */
export async function startRijksmuseumImport(museumId: string) {
  const supabase = getServiceClient();

  let importedCount = 0;
  const maxPages = 5; // 5 * 100 = 500 ruwe records; streng gefilterd over kwaliteit

  for (let page = 1; page <= maxPages; page++) {
    const artObjects = await fetchRijksPage(page);
    if (!artObjects.length) break;

    const mapped = artObjects
      .map(mapAndFilterRijksObject)
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (!mapped.length) continue;

    const { error } = await supabase
      .from("artworks")
      .insert(mapped.map((m) => ({ museum_id: museumId, ...m })));

    if (error) {
      console.error("Fout bij opslaan artworks", error);
      throw new Error(error.message);
    }

    importedCount += mapped.length;
  }

  return { importedCount };
}
