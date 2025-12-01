// app/api/artworks/[id]/route.ts
import { NextResponse } from 'next/server';
import { getArtworkById } from '@/lib/repos/artworkRepo';

type Params = {
  params: { id: string };
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = params;

    const artwork = await getArtworkById(id);

    if (!artwork) {
      return NextResponse.json(
        {
          success: false,
          code: 'ARTWORK_NOT_FOUND',
          message: 'Kunstwerk is niet gevonden.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        artwork
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/artworks/:id] server error:', error);

    return NextResponse.json(
      {
        success: false,
        code: 'SERVER_ERROR',
        message: 'Er ging iets mis bij het ophalen van het kunstwerk.'
      },
      { status: 500 }
    );
  }
}
