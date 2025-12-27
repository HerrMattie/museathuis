import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CONFIG = {
  SIZES: { SALON: 30, TOUR: 8 },
  AI_MODEL: "gemini-2.5-flash", 
};

const AI_REGISSEUR_PROMPT = `Je bent de Hoofd Curator en Regisseur van een digitaal museum.`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. AUTH CHECK
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const task = searchParams.get('task'); // 'salon', 'tour', 'focus', 'game'

  const today = new Date().toISOString().split('T')[0];
  const model = genAI.getGenerativeModel({ model: CONFIG.AI_MODEL, systemInstruction: AI_REGISSEUR_PROMPT });
  const usedArtworkIds: number[] = []; 
  const logs: string[] = [];
  const log = (msg: string) => { console.log(msg); logs.push(msg); };

  log(`🚀 Start Taak: ${task}`);

  try {
    // ========================================================================
    // TAAK: MAAK 1 SALON
    // ========================================================================
    if (task === 'salon') {
        const { data: arts } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.SALON });
        
        if (!arts || arts.length < 15) throw new Error("Te weinig artworks");
        arts.forEach((a: any) => usedArtworkIds.push(a.id));

        const artList = arts.map((a: any) => `- "${a.title}"`).join("\n");
        const prompt = `Collectie van ${arts.length} werken:\n${artList}\nVerzin titel en ondertitel. JSON: { "titel": "...", "ondertitel": "..." }`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        let json;
        try { json = JSON.parse(text); } catch { json = { titel: "Dagelijkse Salon", ondertitel: "Kunst Selectie" }; }

        await supabase.from('salons').insert({
            title: json.titel, subtitle: json.ondertitel, artwork_ids: arts.map((a: any) => a.id), date: today
        });
        log(`✅ Salon "${json.titel}" aangemaakt.`);
    }

    // ========================================================================
    // TAAK: MAAK 1 TOUR
    // ========================================================================
    else if (task === 'tour') {
        const { data: arts } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.TOUR });
        if (!arts || arts.length < 4) throw new Error("Te weinig artworks");
        arts.forEach((a: any) => usedArtworkIds.push(a.id));

        const artList = arts.map((a: any) => `- "${a.title}"`).join("\n");
        const prompt = `Route met ${arts.length} werken:\n${artList}\nVerzin titel en intro. JSON: { "titel": "...", "intro": "..." }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        let json;
        try { json = JSON.parse(text); } catch { json = { titel: "Museum Tour", intro: "Ontdek deze werken." }; }

        await supabase.from('tours').insert({
            title: json.titel, intro: json.intro, artwork_ids: arts.map((a: any) => a.id), date: today
        });
        log(`✅ Tour "${json.titel}" aangemaakt.`);
    }

    // ========================================================================
    // TAAK: MAAK 1 FOCUS & 1 GAME
    // ========================================================================
    else if (task === 'extras') {
        // Focus
        const { data: focusArt } = await supabase.rpc('get_random_artworks', { aantal: 1 });
        if (focusArt?.[0]) {
            const art = focusArt[0];
            const res = await model.generateContent(`Korte 'wist-je-dat' over: ${art.title}. Max 1 zin.`);
            await supabase.from('focus_items').insert({
                title: art.title, content: res.response.text().trim(), artwork_id: art.id, date: today, cover_image: art.image_url
            });
            usedArtworkIds.push(art.id);
            log(`✅ Focus: ${art.title}`);
        }
        // Game
        const { data: gameArt } = await supabase.rpc('get_random_artworks', { aantal: 1 });
        if (gameArt?.[0]) {
            await supabase.from('games').insert({ type: 'trivia', artwork_id: gameArt[0].id, date: today, question: `Vraag over ${gameArt[0].title}?` });
            usedArtworkIds.push(gameArt[0].id);
            log(`✅ Game aangemaakt.`);
        }
    }

    // DB UPDATE
    if (usedArtworkIds.length > 0) {
        await supabase.from('artworks').update({ last_used_at: new Date().toISOString() }).in('id', Array.from(new Set(usedArtworkIds)));
    }

    return NextResponse.json({ success: true, logs });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
