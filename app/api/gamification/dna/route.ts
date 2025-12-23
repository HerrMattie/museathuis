import { createClient } from '@/lib/supabaseServer';
import { updateArtDNA } from '@/lib/gamification/updateArtDNA';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = createClient(cookies());
  
  // 1. Check of gebruiker is ingelogd
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Ontvang het kunstwerk
  const body = await request.json();
  const { artwork } = body;

  if (!artwork) return NextResponse.json({ error: 'No artwork data' }, { status: 400 });

  try {
    // 3. ROEP DE SLIMME REKENMACHINE AAN
    await updateArtDNA(user.id, artwork);
    
    return NextResponse.json({ success: true, message: 'DNA Updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update DNA' }, { status: 500 });
  }
}
