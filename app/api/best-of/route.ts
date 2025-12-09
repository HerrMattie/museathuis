import { NextResponse } from 'next/server';

export async function GET() {
  // Dit is een placeholder om de build error te verhelpen.
  // In Stap 6 (Best Of) gaan we hier de logica bouwen om de
  // populairste tours en werken op te halen.
  
  return NextResponse.json({ 
    message: "Best-of API endpoint waiting for implementation in Phase 6",
    data: []
  });
}
