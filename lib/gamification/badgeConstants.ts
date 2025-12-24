// Mapping van Badge Naam (in code) naar Supabase UUID (uit database export)
// Deze lijst bevat ALLE badges uit jouw CSV.

export const BADGE_IDS = {
    // --- TIJD & DATUM ---
    NACHTWACHT: '482d3de3-e1f5-4a0a-ae4d-2976dd2a4b9f',       // 00:00 - 04:00
    VROEGE_VOGEL: '1d7454af-4c38-4738-a67c-8706914a9d8c',     // 05:00 - 07:00
    LUNCHPAUZE: '64d98c0c-00e7-43ed-83d7-4fd7ed58c3f9',       // 12:00 - 13:00
    SLAAPKOP: 'ffacf5fe-a2d8-4341-af20-9e7ec0931c71',         // Eerste bezoek > 14:00
    VRIJMIBO: 'e3138d55-af34-4f95-ac2c-faf772d340de',         // Vrijdag > 17:00
    OP_DE_VALREEP: 'f7f89b97-546d-4c14-93f6-0d637cf95952',    // 23:50 - 23:59
    DONKERE_MODUS: 'cdd6d903-25d7-4242-80cc-bb516c0f5352',    // Avond gebruik

    // --- SPECIALE DAGEN ---
    KERST_2025: '056f217f-a3f6-440b-8edc-2fdfe51b62e8',       // 25-26 Dec
    KERSTMIS: '3eaf8043-6e08-497d-be65-fb9baceb0d8d',         // Algemeen Kerst
    OLIEBOL: '31ab2192-61c6-4fef-b80b-ee6f3747c231',          // 31 Dec - 1 Jan
    VALENTIJN: '8da903f2-3af6-47fa-a0c2-dc4fd3040349',        // 14 Feb
    KONINGSDAG: 'f21272fc-0f04-4024-9ec1-94392601066f',       // 27 Apr
    GRIEZELIG: '925f79d4-8918-4d48-baff-1afb94cfb70f',        // 31 Okt (Halloween)
    BLAUWE_MAANDAG: '36265e41-3062-4fbc-9180-b64312a5fcbc',   // 3e maandag Jan

    // --- STREAKS ---
    DE_KOP_IS_ERAF: '61a92d96-932b-4183-988c-d64052b5abfa',   // 3 dagen
    WEEK_WINNAAR: 'c80ebaa6-f20d-47c1-a9c1-aae016c89356',     // 7 dagen
    TWEE_WEKEN_TROUW: '07191855-60d0-4cc6-9319-9a7fed5b4587', // 14 dagen
    MAAND_MEESTER: '27d21841-1279-43c8-a299-17eb968e5d7c',    // 30 dagen
    SEIZOENSKAART: '07ff5e03-3ac8-43e7-afcc-e4f8f7758068',    // 90 dagen
    DE_100_CLUB: 'd3fd1a9c-2f06-42f5-bc9e-df6971a7d3b8',      // 100 dagen
    JAARRING: 'fb949c6a-d783-423a-8886-5be25b41d760',         // 365 dagen
    WEEKEND_WARRIOR: 'fcebe654-45b6-49f1-91fd-d0a9e3d63554',  // Za + Zo

    // --- CONTENT: ARTIKELEN (FOCUS) ---
    BOEKENWURM: '62e076d8-8a05-4cb8-919b-1032ef375c80',       // 3 artikelen
    BIBLIOTHECARIS: '1ee27677-9122-480f-954b-d5e428cdf5f1',  // 20 artikelen
    DIEPGRAVER: '137d6910-6633-4a11-84af-98ae1f0dc953',       // > 2000 woorden
    SCANNER: 'e27c4224-6877-4b5c-90af-e6a2cce76286',          // < 5 seconden
    VERF_DROOGT: '18364089-4100-485c-85b5-759f825a55e8',      // > 10 minuten op pagina

    // --- CONTENT: KUNST KIJKEN (TOURS) ---
    EERSTE_BLIK: '3aa6c472-d58b-4c24-a01c-37e9acf038ce',      // 1e kunstwerk
    NIEUWSGIERIG: 'a4593696-708c-4aa6-a4d0-8ce30385ee2f',     // 10 kunstwerken
    KUNSTLIEFHEBBER: '6c4a4d61-eaa0-423d-81a7-b89dbcb934de',  // 50 kunstwerken
    MUSEUMKAART: '3ac3a051-d2f2-4f5b-81f5-187efd4eacc1',      // 100 kunstwerken
    CURATOR: '4f107dde-30f2-4ab0-87a8-5809b72fd1ab',          // 500 kunstwerken
    LEVEND_INVENTARIS: '2501da20-79ad-4096-bc9e-3ac271e9bc75',// 1000 kunstwerken
    EXCLUSIEF: 'af44ce0b-444b-4d44-9513-36305fb1344b',        // Alle werken in Salon
    PORTRET_JAGER: '17f62e9d-6c40-44d1-a461-50417048f3aa',    // 10 portretten

    // --- CONTENT: GENRES & THEMA'S ---
    HOLLANDSE_GLORIE: 'c4b5e924-7c26-4651-889a-ca95647e5952', // 5x Rembrandt/Vermeer
    DIERENVRIEND: 'e4289477-7963-42d5-b90d-dc8c65a89bf7',     // 10x Dieren
    LANDSCHAPSARCHITECT: 'e6165de7-8936-4c80-b030-fb8d16c43997', // 10x Landschap
    MONOCHROOM: 'b312cf87-3cfe-4250-a3af-af9f31de13c2',       // 5x Zwart-wit
    FRANSE_SLAG: '72bd7b24-a569-4343-80b0-714c74b812c6',      // 5x Impressionisme
    MODERNIST: '56e86b21-fb83-4029-b713-cf371babfc5d',        // 5x 20e eeuw

    // --- GAMES & QUIZ ---
    BEGINNER: 'ac373d55-24f2-4c5c-956e-098ee7c98bdc',         // Eerste quiz
    QUIZ_MEESTER: 'd09dfff2-a1c0-4c84-9ad1-56cf898ea471',     // 10x gewonnen
    PROFESSOR: '99d638ae-061c-486b-81cf-902f4a0143a8',        // 50x gewonnen
    SCHERPSCHUTTER: '7c8420ec-be96-4822-a8dc-23ecc8a2420f',   // 100% score
    SNELHEIDSDUIVEL: 'd4fa1f6f-5625-415c-b396-9775f7d1154b',  // Binnen 20s
    PECHVOGEL: '14b61dd8-6177-4d2a-8363-125cc3153d78',        // 0 vragen goed
    SLOW_MOTION: 'e6de97a7-ac1c-477c-8406-34c6988a5512',      // > 5 min over quiz
    ZONDAGSKIND: 'feecc4cf-35dc-434b-bcc7-9eae42779faf',      // Gewonnen op zondag

    // --- INTERACTIE: FEEDBACK & SOCIAAL ---
    INFLUENCER: '37cd1dc9-40b7-4e62-9588-0d8240eaf876',       // Delen (ID hergebruikt van oude export, checken!)
    RECENSENT: '39f7ea19-2336-4c1c-897a-eca4907d08ed',        // 1e review
    FEEDBACK_KONING: 'cd45d6e3-c0bd-4304-901d-5e6d407b84aa',  // 10 reviews
    FANBOY: '76f5ca4f-add9-4b8e-8225-a20e195412f7',           // 5 sterren
    KRITISCHE_NOOT: 'c6dfdb0d-e6fb-4350-959b-05240972f804',   // 1 ster review
    TINDER_GEDRAG: '833820e9-39aa-41e9-97d9-baa167afb73d',    // Snel swipen
    KLIKVINGER: 'a730af7e-5ef8-4238-a39c-8cc5d14f4820',       // Veel klikken

    // --- ACCOUNT & FUN ---
    WELKOMSTCOMITE: 'de0963f4-c2b3-4655-a27a-dbed95535983',   // Onboarding klaar
    PROFIEL_PLAATJE: '79aa47d2-a653-4ddf-b0ac-c4a11eec6707',  // Avatar gewijzigd
    INSTELLINGEN_GURU: 'f4318be6-4bbf-4c07-ac1c-3dcac5685199',// Alle settings aangepast
    VIP: '42be6afa-7935-43f5-b8cc-c946e5fcb82e',              // Premium geworden
    KRENT: '0b707be7-cda6-47cd-ad18-e5f1fb62b484',            // Alleen gratis
    GOUDZOEKER: 'c33bb589-128d-463a-9e66-57be4cebd0aa',       // Alleen premium
    DE_DEUR_STAAT_OPEN: 'daebb7f6-0a53-4e84-840d-d67a1046f410', // Salon bezocht
    VERDWAALD: '76695777-03e0-4e7d-a374-5e51e92b372d',        // 404 pagina
    SUPPORTER: 'eea3b3c7-8ff3-416d-b23c-9ce637403cb8',        // Over ons
    GLITCH_HUNTER: 'ea533bac-d558-4700-8b76-7ffcd95c38d6',    // Bug gemeld
};
