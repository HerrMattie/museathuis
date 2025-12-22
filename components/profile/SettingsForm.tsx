const handleSave = async () => {
    setLoading(true);
    try {
        // We sturen alleen de velden op die we écht willen wijzigen
        // En we zorgen dat arrays ALTIJD als schone JS-arrays gaan
        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: user.id,
                full_name: fullName,
                display_name: fullName,
                avatar_url: selectedAvatar,
                province: province,
                age_group: ageGroup,
                education_level: education,
                work_field: workField,
                art_interest_level: artLevel,
                museum_visit_frequency: frequency,
                visit_company: company,
                // Cruciaal: als favPeriods leeg is, sturen we een lege array [] en geen null
                favorite_periods: favPeriods || [], 
                museum_cards: hasMuseumCard,
                has_museum_card: hasMuseumCard,
                updated_at: new Date().toISOString(),
                has_completed_onboarding: true
            }, { 
                onConflict: 'user_id',
                ignoreDuplicates: false 
            });

        if (error) {
            // Als er een recursion error is, komt hij hier in de console
            console.error("Database Error:", error);
            throw error;
        }
        
        alert("🎉 Instellingen succesvol opgeslagen!");
        
    } catch (err: any) {
        alert(`Fout bij opslaan: ${err.message}`);
    } finally {
        setLoading(false);
    }
};
