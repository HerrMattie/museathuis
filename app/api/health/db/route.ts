// app/api/health/db/route.ts
import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const { error } = await supabaseServerClient.from('tours').select('id').limit(1);

    if (error) {
      console.error('[GET /api/health/db] DB error:', error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/health/db] server error:', error);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
