// app/api/tour/today/route.ts
import { NextResponse } from 'next/server';
import { getTourOfToday } from '@/lib/repos/tourRepo';

export async function GET() {
  try {
    const tour = await getTourOfToday();

    if (!tour) {
      return NextResponse.json(
        {
          success: false,
          code: 'NO_TOUR_TODAY',
          message: 'Er is vandaag geen gepubliceerde tour ingepland.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        tour
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/tour/today] server error:', error);

    return NextResponse.json(
      {
        success: false,
          code: 'SERVER_ERROR',
          message: 'Er ging iets mis bij het ophalen van de tour.'
      },
      { status: 500 }
    );
  }
}
