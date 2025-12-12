'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import OnboardingModal from './OnboardingModal';

export default function OnboardingCheck() {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('has_completed_onboarding')
                .eq('user_id', user.id)
                .single();

            if (profile && !profile.has_completed_onboarding) {
                setUser(user);
                setShowOnboarding(true);
            }
        };
        checkUser();
    }, []);

    if (!showOnboarding) return null;

    return <OnboardingModal user={user} onComplete={() => setShowOnboarding(false)} />;
}
