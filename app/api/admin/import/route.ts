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
    image_url: "https://www.me_
