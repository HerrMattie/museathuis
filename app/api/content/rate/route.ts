import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { userId, contentId, contentType, rating } = await req.json();

        const { data, error } = await supabase
            .from('content_ratings')
            .upsert({
                user_id: userId,
                content_id: contentId,
                content_type: contentType,
                rating: rating
            }, { onConflict: 'user_id, content_id' })
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
