import { NextResponse } from "next/server";

export async function GET() {
  const tour = {
    id: "test-tour-1",
    title: "Testtour: Schilderijen uit de Gouden Eeuw",
    intro:
      "Een korte testtour langs een paar voorbeeldwerken. Deze data komt nu uit een mock-API en wordt later vervangen door echte tours uit het CRM.",
    durationMinutes: 18,
    works: [
      {
        id: "work-1",
        title: "Portret van een koopman",
        artist: "Voorbeeldkunstenaar",
        museum: "Rijksmuseum",
      },
      {
        id: "work-2",
        title: "Gezicht op de haven",
        artist: "Voorbeeldkunstenaar",
        museum: "Rijksmuseum",
      },
      {
        id: "work-3",
        title: "Stilleven met boeken",
        artist: "Voorbeeldkunstenaar",
        museum: "Rijksmuseum",
      },
    ],
  };

  return NextResponse.json(tour);
}
