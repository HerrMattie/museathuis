import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Zorg dat je deze hebt
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// 1. CONFIGURATIE & INSTELLINGEN
// ============================================================================

const CONFIG = {
  // Hoeveel items wil je per dag genereren?
  TARGETS: {
    SALONS: 2,  // Probeer 2 salons te maken
    TOURS: 1,   // 1 Tour is vaak standaard, zet op 2 als je er meer wilt
    GAMES: 2,   // 1 Multiple Choice + 1 Open vraag = 2 totaal
    FOCUS: 1    // 1 Focus artikel
  },
  // Instellingen voor de AI
  AI_MODEL: "gemini-1.5-flash",
};

// Supabase & AI Clients initialiseren
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Gebruik SERVICE ROLE voor cronjobs!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const maxDuration = 60; // Seconden (Verhoog naar 300 voor Pro plan)
export const dynamic = 'force-dynamic';

// ============================================================================
// 2. HELPER FUNCTIES
// ============================================================================

// Een simpele logger die we later terugsturen in de JSON
const executionLogs: string[] = [];
const log = (msg: string, type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' = 'INFO') => {
  const icon = type === 'INFO' ? '🔹' : type === 'SUCCESS' ? '✅' : type === 'ERROR' ? '❌' : '⚠️';
  const line = `${icon} ${msg}`;
  console.log(line);
  executionLogs.push(line);
};

// ============================================================================
// 3. DE HOOFD LOGICA
// ============================================================================

export async function GET(request: NextRequest) {
  const runId = crypto.randomUUID();
  let hasCriticalErrors = false; // We houden bij of er iets faalt
  const today = new Date().toISOString().split('T')[0];

  log(`Start Daily Generatie voor: ${today}`, 'INFO');

  try {
    // -----------------------------------------------------------------------
    // STAP A: THEMA & CURATOR
    // -----------------------------------------------------------------------
    log("Curator AI aan het werk voor thema selectie...", 'INFO');
    
    // ... Hier jouw logica om thema te kiezen ...
    // SIMULATIE:
    const theme = "Portretten en Zelfportretten"; 
    log(`Thema gekozen: "${theme}"`, 'SUCCESS');


    // -----------------------------------------------------------------------
    // STAP B: SALONS (Jij had er 0, laten we checken waarom)
    // -----------------------------------------------------------------------
    log(`Start Salon Generatie (Doel: ${CONFIG.TARGETS.SALONS})...`, 'INFO');
    
    let salonsCreated = 0;
    try {
        // Haal beschikbare werken op
        // ... jouw logica ...
        
        // STEL: Je hebt hier een filter dat te streng is?
        // Check: if (availableArtworks.length < 5) throw new Error("Te weinig kunst voor een salon");

        // Als er 0 uitkomen, loggen we dat expliciet als waarschuwing
        if (salonsCreated === 0) {
            log(`Geen Salons aangemaakt. Mogelijke oorzaken: te weinig kunstwerken beschikbaar voor thema "${theme}" of cooldown actief.`, 'WARN');
        } else {
            log(`${salonsCreated} Salons aangemaakt.`, 'SUCCESS');
        }
    } catch (err: any) {
        log(`Salon Generatie mislukt: ${err.message}`, 'ERROR');
        hasCriticalErrors = true;
    }


    // -----------------------------------------------------------------------
    // STAP C: TOURS (Jij vond 1 te weinig?)
    // -----------------------------------------------------------------------
    log(`Start Tour Generatie (Doel: ${CONFIG.TARGETS.TOURS})...`, 'INFO');

    for (let i = 0; i < CONFIG.TARGETS.TOURS; i++) {
        try {
            log(`Genereren Tour #${i + 1}...`, 'INFO');
            
            // ... Jouw AI Tour generatie logica ...
            // const tourContent = await model.generateContent(...)
            
            // OPSLAAN IN DB
            // const { error } = await supabase.from('tours').insert(...)
            // if (error) throw error;

            log(`Tour #${i + 1} succesvol opgeslagen.`, 'SUCCESS');
        } catch (err: any) {
            log(`Tour #${i + 1} mislukt: ${err.message}`, 'ERROR');
            hasCriticalErrors = true;
        }
    }


    // -----------------------------------------------------------------------
    // STAP D: FOCUS ARTIKEL (Hier ging het mis!)
    // -----------------------------------------------------------------------
    log("Start Focus Artikel generatie...", 'INFO');
    
    try {
        const focusSubject = "Self-portrait"; // Dynamisch uit AI
        log(`Focus onderwerp: ${focusSubject}`, 'INFO');

        // ... AI genereert tekst ...

        // HIER ZIT DE SQL FOUT MOGELIJKHEID
        // We proberen het op te slaan:
        /* const { error } = await supabase.from('focus_items').insert({
            date: today,
            theme: theme,
            title: `Focus op: ${focusSubject}`,
            content: "Gegenereerde tekst...",
            cover_image: "https://....jpg" // <--- DEZE KOLOM MOET BESTAAN
        });
        
        if (error) throw error; 
        */

        // Omdat ik je echte DB call niet heb, simuleer ik hier wat er gebeurde:
        // Als de kolom niet bestaat, gooit Supabase hier een error.
        
        log("Focus artikel succesvol opgeslagen.", 'SUCCESS');

    } catch (err: any) {
        // Dit vangt de 'Could not find column' fout op
        console.error("FULL DB ERROR:", err); // Voor Vercel logs
        log(`❌ Focus Opslaan Fout: ${err.message || JSON.stringify(err)}`, 'ERROR');
        hasCriticalErrors = true;
    }


    // -----------------------------------------------------------------------
    // STAP E: GAMES (Jij had er 2, dat lijkt te kloppen)
    // -----------------------------------------------------------------------
    log(`Start Games Generatie (Doel: ${CONFIG.TARGETS.GAMES})...`, 'INFO');
    
    // Game 1: Multiple Choice
    try {
        log("Genereren Game 1 (Multiple Choice)...", 'INFO');
        // ... logic ...
        log("Game 1 aangemaakt.", 'SUCCESS');
    } catch (err: any) {
        log(`Game 1 mislukt: ${err.message}`, 'ERROR');
        hasCriticalErrors = true;
    }

    // Game 2: Open Vraag
    try {
        log("Genereren Game 2 (Open Vraag)...", 'INFO');
        // ... logic ...
        log("Game 2 aangemaakt.", 'SUCCESS');
    } catch (err: any) {
        log(`Game 2 mislukt: ${err.message}`, 'ERROR');
        hasCriticalErrors = true;
    }


    // -----------------------------------------------------------------------
    // AFSLUITING & RAPPORTAGE
    // -----------------------------------------------------------------------
    
    if (hasCriticalErrors) {
        log("⚠️ De cronjob is voltooid, maar er waren fouten. Controleer de logs hierboven.", 'WARN');
    } else {
        log("🚀 Alles succesvol afgerond!", 'SUCCESS');
    }

    // We retourneren een statuscode 500 als er fouten waren, zodat je monitoring tool het ziet.
    // Maar we sturen wel de JSON mee zodat jij de logs kunt lezen.
    return NextResponse.json({
        success: !hasCriticalErrors, // Dit is nu EERLIJK (false als er errors waren)
        date: today,
        runId,
        theme,
        config_targets: CONFIG.TARGETS,
        execution_logs: executionLogs
    }, { status: hasCriticalErrors ? 500 : 200 });

  } catch (globalError: any) {
    // Vangt alles op wat hierboven niet gevangen is (bijv. crash in AI client init)
    log(`CRITICAL SYSTEM FAILURE: ${globalError.message}`, 'ERROR');
    
    return NextResponse.json({
        success: false,
        error: globalError.message,
        execution_logs: executionLogs
    }, { status: 500 });
  }
}
