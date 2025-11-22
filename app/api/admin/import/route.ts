import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SeedArtwork = {
  external_id: string;
  source: string;
  title: string;
  artist?: string | null;
  dating?: string | null;
  museum: string;
  image_url?: string | null;
};

const SEED_ARTWORKS: SeedArtwork[] = [
  // Rijksmuseum (NL)
  {
    external_id: "SK-C-5",
    source: "rijksmuseum",
    title: "De Nachtwacht",
    artist: "Rembrandt van Rijn",
    dating: "1642",
    museum: "Rijksmuseum",
    image_url: "https://www.rijksmuseum.nl/en/collection/SK-C-5"
  },
  {
    external_id: "SK-A-3262",
    source: "rijksmuseum",
    title: "Melkmeisje",
    artist: "Johannes Vermeer",
    dating: "ca. 1660",
    museum: "Rijksmuseum",
    image_url: "https://www.rijksmuseum.nl/en/collection/SK-A-2344"
  },

  // The Metropolitan Museum of Art (US)
  {
    external_id: "436121",
    source: "met",
    title: "Bridge over a Pond of Water Lilies",
    artist: "Claude Monet",
    dating: "1899",
    museum: "The Metropolitan Museum of Art",
    image_url: "https://www.metmuseum.org/art/collection/search/436121"
  },
  {
    external_id: "436535",
    source: "met",
    title: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    dating: "1889",
    museum: "The Metropolitan Museum of Art",
    image_url: "https://www.metmuseum.org/art/collection/search/436535"
  },

  // Art Institute of Chicago (US)
  {
    external_id: "27992",
    source: "aic",
    title: "A Sunday on La Grande Jatte",
    artist: "Georges Seurat",
    dating: "1884–1886",
    museum: "Art Institute of Chicago",
    image_url: "https://www.artic.edu/artworks/27992"
  },
  {
    external_id: "14688",
    source: "aic",
    title: "American Gothic",
    artist: "Grant Wood",
    dating: "1930",
    museum: "Art Institute of Chicago",
    image_url: "https://www.artic.edu/artworks/14688"
  },

  // National Gallery of Art (Washington)
  {
    external_id: "12148",
    source: "nga",
    title: "Girl with the Red Hat",
    artist: "Johannes Vermeer",
    dating: "c. 1665–1666",
    museum: "National Gallery of Art, Washington",
    image_url: "https://www.nga.gov/collection/art-object-page.12148.html"
  },
  {
    external_id: "61379",
    source: "nga",
    title: "Ginevra de' Benci",
    artist: "Leonardo da Vinci",
    dating: "c. 1474–1478",
    museum: "National Gallery of Art, Washington",
    image_url: "https://www.nga.gov/collection/art-object-page.50724.html"
  }
];

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase credentials not set" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false }
  });

  // 1. Check of er al artworks zijn
  const { count, error: countError } = await supabase
    .from("artworks")
    .select("*", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json(
      { ok: false, error: countError.message },
      { status: 500 }
    );
  }

  if (count && count > 0) {
    return NextResponse.json({
      ok: true,
      message: `Artworks table already contains ${count} records. Seed skipped.`
    });
  }

  // 2. Seed-data invoeren
  let inserted = 0;
  for (const art of SEED_ARTWORKS) {
    const { error } = await supabase.from("artworks").insert({
      external_id: art.external_id,
      source: art.source,
      title: art.title,
      artist: art.artist,
      dating: art.dating,
      museum: art.museum,
      image_url: art.image_url
    });

    if (error) {
      // Voor nu loggen we alleen; in een latere fase kunnen we dit verfijnen
      console.error("Insert error for", art.external_id, error.message);
    } else {
      inserted++;
    }
  }

  return NextResponse.json({
    ok: true,
    message: `Seed completed. Inserted ${inserted} artworks.`
  });
}
