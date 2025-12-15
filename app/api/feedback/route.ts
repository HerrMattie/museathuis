import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer'; // <--- AANGEPAST: Dit is jouw juiste pad
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  // 1. Initialiseer Supabase met cookies (Server context)
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 2. Check User
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Lees data
  const { entity_type, entity_id, vote } = await req.json();

  // Validatie
  if (!['up', 'down'].includes(vote)) {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 });
  }

  // 4. Upsert (Toevoegen of Updaten)
  const { error } = await supabase
    .from('user_feedback')
    .upsert({ 
      user_id: user.id, 
      entity_type, 
      entity_id, 
      vote 
    }, { onConflict: 'user_id, entity_type, entity_id' });

  if (error) {
      console.error("Feedback error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
