import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithAI } from '@/lib/aiHelper';
import { addDays, format, subDays, parseISO } from 'date-fns';
import { WEEKLY_STRATEGY, PROMPTS } from '@/lib/scheduleConfig';

// BELANGRIJK: Gebruik de SERVICE_ROLE_KEY voor cronjobs
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export const maxDuration = 300; // 5 minuten timeout
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Beveiliging
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const generatedDays = [];
    
    // Config: Hoe lang moet een kunstwerk op de "strafbank" na gebruik?
    const COOLDOWN_DAYS = 60; 
    const cooldownDate = subDays(today, COOLDOWN_DAYS);

    // Loop door de komende 7 dagen
    for (let i = 0; i < 7; i++) {
        const targetDate = addDays(today, i);
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        const dayOfWeek = targetDate.getDay();

        // 1. Check of dag al gevuld is
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('id')
            .eq('day_date', dateStr)
            .single();

        if (existing) {
            console.log(`Dag ${dateStr} is al gevuld.`);
            continue;
        }

        console.log(`🤖 Curator aan het werk voor ${dateStr}...`);
        
        // We houden bij welke kunstwerken we DEZE run gebruiken
        let usedArtworkIds: string[] = [];

        // ---------------------------------------------------------
        // STAP A: HET MAGAZIJN (Met Versheids-Check 🥬)
        // ---------------------------------------------------------
        // We halen 300 werken op, zodat we na het filteren nog genoeg overhouden
        const { data: rawPool } = await supabase
            .rpc('get_random_artworks', { limit_count: 300 });

        if (!rawPool) continue;

        // FILTER: Gooi kunstwerken weg die recent (last_used_at) zijn gebruikt
        const artPool = rawPool.filter((a: any) => {
            if (!a.last_used_at) return true; // Nog nooit gebruikt = Prima
            return parseISO(a.last_used_at) < cooldownDate; // Alleen ouder dan 60 dagen
        });

        if (artPool.length < 50) {
            console.log("⚠️ Te weinig 'verse' kunstwerken beschikbaar. Importeer meer kunst!");
            continue;
        }

        // Lijst voor de AI
        const catalogList = artPool.slice(0, 100).map((a:any) => `[${a.id}] "${a.title}" van ${a.artist}`).join('\n');

        // ---------------------------------------------------------
        // STAP B: THEMA & SELECTIE
        // ---------------------------------------------------------
        const curationPrompt = `
        Jij bent de hoofdcurator. Hier is een lijst met kunstwerken:
        ${catalogList}

        OPDRACHT:
        Kies PRECIES 8 kunstwerken die een STERKE SAMENHANG hebben (Audiotour).
        
        Geef JSON:
        {
            "theme_title": "Titel",
            "theme_description": "Korte uitleg",
            "selected_ids": ["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8"] 
        }
        `;

        const curationData: any = await generateWithAI(curationPrompt, true);
        
        const theme = curationData?.theme_title || "Kunst van de Dag";
        const themeDesc = curationData?.theme_description || "Een bijzondere selectie.";
        const tourIds = curationData?.selected_ids || [];

        // Zoek objecten erbij
        const tourSelection = artPool.filter((a:any) => tourIds.includes(a.id));
        
        // Voeg deze ID's toe aan de lijst van "gebruikt"
        tourSelection.forEach((a:any) => usedArtworkIds.push(a.id));

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP C: TOUR GENEREREN
        // ---------------------------------------------------------
        if (tourSelection.length > 0) {
            const tourContext = tourSelection.map((a:any) => `"${a.title}" (${a.artist})`).join(', ');
            
            const tourScriptPrompt = `
            Schrijf een Audiotour script voor thema "${theme}". Werken: ${tourContext}.
            JSON: { 
                "title": "${theme}", 
                "intro_text": "Intro (1 minuut)...", 
                "stops": [
                    { "title": "Titel", "description": "Script van 300 woorden..." }
                ] 
            }`;
            
            const tourContent: any = await generateWithAI(tourScriptPrompt, true);

            if (tourContent?.stops) {
                const stopsWithImages = tourContent.stops.map((stop: any, idx: number) => ({
                    ...stop,
                    image_id: tourSelection[idx]?.id,
                    image_url: tourSelection[idx]?.image_url,
                    audio_url: tourSelection[idx]?.audio_url
                }));

                const { data: tour } = await supabase.from('tours').insert({
                    title: tourContent.title,
                    intro: tourContent.intro_text,
                    stops_data: { stops: stopsWithImages },
                    hero_image_url: tourSelection[0]?.image_url,
                    status: 'published',
                    type: 'daily',
                    is_premium: false,
                    scheduled_date: dateStr
                }).select().single();
                
                if(tour) createdIds.tours.push(tour.id);
            }
        }

        // ---------------------------------------------------------
        // STAP D: SALON (30 Stuks)
        // ---------------------------------------------------------
        // We filteren de pool opnieuw om te voorkomen dat we werken kiezen die NET in de tour zitten (voor variatie),
        // tenzij je juist overlap wilt. Voor nu laten we overlap toe voor een consistent thema.
        
        const salonPrompt = `
        Kies uit de lijst PRECIES 30 kunstwerken voor een "Slow TV" screensaver.
        Focus op visuele harmonie.
        JSON: { "title": "...", "description": "...", "selected_ids": ["id1", ... "id30"] }
        `;

        const salonData: any = await generateWithAI(salonPrompt, true);

        if (salonData?.selected_ids) {
            // Voeg toe aan used lijst
            salonData.selected_ids.forEach((id: string) => {
                if(!usedArtworkIds.includes(id)) usedArtworkIds.push(id);
            });

            const { data: salon } = await supabase.from('salons').insert({
                title: salonData.title,
                description: salonData.description,
                image_url: artPool.find((a:any) => a.id === salonData.selected_ids[0])?.image_url,
                status: 'published',
                is_premium: true
            }).select().single();

            if (salon) {
                createdIds.salons.push(salon.id);
                const salonItems = salonData.selected_ids.map((artId: string, idx: number) => ({
                    salon_id: salon.id, artwork_id: artId, position: idx
                }));
                await supabase.from('salon_items').insert(salonItems);
            }
        }

        // ---------------------------------------------------------
        // STAP E: FOCUS & GAMES
        // ---------------------------------------------------------
        // Focus Items (Ook markeren als used)
        const focusSelection = [tourSelection[0], artPool[Math.floor(Math.random() * artPool.length)]];
        focusSelection.forEach((a:any) => { if(a && !usedArtworkIds.includes(a.id)) usedArtworkIds.push(a.id); });

        for(let i=0; i<focusSelection.length; i++) {
            const art = focusSelection[i];
            if(!art) continue;
            const fData:any = await generateWithAI(`Schrijf artikel over "${art.title}". JSON: { "title": "...", "intro": "...", "content_markdown": "..." }`, true);
            if(fData) {
                const { data: f } = await supabase.from('focus_items').insert({
                    title: fData.title, intro: fData.intro, content_markdown: fData.content_markdown, cover_image: art.image_url, status: 'published', is_premium: i > 0
                }).select().single();
                if(f) createdIds.focus.push(f.id);
            }
        }

        // Games (Gebruiken tour selectie, dus IDs zijn al marked)
        const strategy = WEEKLY_STRATEGY[dayOfWeek];
        const gameTypes = [strategy.slot1, strategy.slot2, strategy.slot3];
        for (let g = 0; g < 3; g++) {
             const type = gameTypes[g];
             const gamePrompt = PROMPTS[type as keyof typeof PROMPTS]
                .replace('{THEME}', theme)
                .replace('{CONTEXT}', tourSelection.map((a:any) => a.title).join(', '));
             
             const gData:any = await generateWithAI(gamePrompt, true);
             if(gData) {
                 const { data: gm } = await supabase.from('games').insert({
                     title: `${theme}: ${type}`, short_description: "Challenge", type: type, status: 'published', is_premium: g > 0
                 }).select().single();
                 if(gm) {
                     createdIds.games.push(gm.id);
                     const items = Array.isArray(gData) ? gData : [gData];
                     await supabase.from('game_items').insert(items.map((it:any, idx:number) => ({
                         game_id: gm.id, question: it.question, correct_answer: it.correct_answer, wrong_answers: it.wrong_answers, image_url: tourSelection[idx%tourSelection.length]?.image_url, order_index: idx
                     })));
                 }
             }
        }

        // ---------------------------------------------------------
        // STAP F: OPSLAAN EN AFSTEMPELEN 📮
        // ---------------------------------------------------------
        
        // 1. Programma Opslaan
        await supabase.from('dayprogram_schedule').insert({
            day_date: dateStr,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
            salon_ids: createdIds.salons,
            theme_title: theme,
            theme_description: themeDesc
        });

        // 2. BELANGRIJK: Update de 'last_used_at' datum van alle gebruikte werken!
        if (usedArtworkIds.length > 0) {
            const { error: updateError } = await supabase
                .from('artworks')
                .update({ last_used_at: new Date().toISOString() })
                .in('id', usedArtworkIds);
            
            if (updateError) console.error("Fout bij updaten last_used_at:", updateError);
            else console.log(`✅ ${usedArtworkIds.length} kunstwerken afgestempeld als gebruikt.`);
        }

        generatedDays.push({ date: dateStr, theme });
    }

    return NextResponse.json({ success: true, days: generatedDays });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
