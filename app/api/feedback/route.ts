import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Of jouw path

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { entity_type, entity_id, vote } = await req.json();

  if (!['up', 'down'].includes(vote)) {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 });
  }

  // Upsert: Voeg toe, of update als hij al bestaat
  const { error } = await supabase
    .from('user_feedback')
    .upsert({ 
      user_id: user.id, 
      entity_type, 
      entity_id, 
      vote 
    }, { onConflict: 'user_id, entity_type, entity_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
