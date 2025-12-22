const handleSave = async () => {
    setLoading(true);
    try {
        const { error } = await supabase
            .from('user_profiles')
            .upsert({  // <--- GEWIJZIGD NAAR UPSERT
                user_id: user.id, // <--- ESSENTIEEL: Koppel aan de juiste gebruiker!
                
                // Identiteit
                full_name: fullName,
                display_name: fullName,
                avatar_url: selectedAvatar,
                
                // Demografie
                province: province,
                age_group: ageGroup,
                education_level: education,
                work_field: workField,
                
                // Gedrag
                museum_visit_frequency: frequency,
                visit_company: company,
                art_interest_level: artLevel,
                
                // Interesses
                favorite_periods: favPeriods,
                
                // Lidmaatschappen
                museum_cards: hasMuseumCard,
                // We slaan dit ook op in 'has_museum_card' voor legacy support, indien die kolom bestaat
                // has_museum_card: hasMuseumCard, 
                
                // Tech
                updated_at: new Date().toISOString(),
                has_completed_onboarding: true
            }, { onConflict: 'user_id' }); // <--- Zorg dat hij update als ID al bestaat

        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }

        alert("Profiel succesvol en volledig bijgewerkt!");
        
    } catch (err: any) {
        console.error(err);
        alert(`Fout bij opslaan: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };
