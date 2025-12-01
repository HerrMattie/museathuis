// app/admin/tours/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServerClient } from '@/lib/supabaseServer';

type CreateTourInput = {
  date: string;
  title: string;
  subtitle?: string;
  isPremium?: boolean;
};

type UpdateTourMetaInput = {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  isPublished: boolean;
  isPremium: boolean;
};

type AddArtworkInput = {
  tourId: string;
  artworkId: string;
  position?: number;
};

type RemoveArtworkInput = {
  tourId: string;
  artworkId: string;
};

export async function createTour(input: CreateTourInput) {
  const supabase = supabaseServerClient;

  const { date, title, subtitle, isPremium } = input;

  const { error } = await supabase.from('tours').insert({
    date,
    title,
    subtitle: subtitle || null,
    is_published: false,
    is_premium: isPremium ?? false
  });

  if (error) {
    console.error('[createTour] fout:', error);
    throw new Error('Kon tour niet aanmaken');
  }

  revalidatePath('/admin/tours');
}

export async function updateTourMeta(input: UpdateTourMetaInput) {
  const supabase = supabaseServerClient;

  const { id, date, title, subtitle, isPublished, isPremium } = input;

  const { error } = await supabase
    .from('tours')
    .update({
      date,
      title,
      subtitle: subtitle || null,
      is_published: isPublished,
      is_premium: isPremium
    })
    .eq('id', id);

  if (error) {
    console.error('[updateTourMeta] fout:', error);
    throw new Error('Kon tour niet bijwerken');
  }

  revalidatePath('/admin/tours');
  revalidatePath(`/admin/tours/${id}`);
  revalidatePath('/tour/today');
}

export async function addArtworkToTour(input: AddArtworkInput) {
  const supabase = supabaseServerClient;
  const { tourId, artworkId, position } = input;

  let finalPosition = position;

  if (!finalPosition) {
    const { data, error } = await supabase
      .from('tour_artworks')
      .select('position')
      .eq('tour_id', tourId)
      .order('position', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[addArtworkToTour] fout ophalen max positie:', error);
      throw new Error('Kon positie niet bepalen');
    }

    finalPosition = data && data.length > 0 ? (data[0].position || 0) + 1 : 1;
  }

  const { error: insertError } = await supabase.from('tour_artworks').insert({
    tour_id: tourId,
    artwork_id: artworkId,
    position: finalPosition
  });

  if (insertError) {
    console.error('[addArtworkToTour] fout insert:', insertError);
    throw new Error('Kon kunstwerk niet aan tour toevoegen');
  }

  revalidatePath(`/admin/tours/${tourId}`);
  revalidatePath('/tour/today');
}

export async function removeArtworkFromTour(input: RemoveArtworkInput) {
  const supabase = supabaseServerClient;
  const { tourId, artworkId } = input;

  const { error } = await supabase
    .from('tour_artworks')
    .delete()
    .eq('tour_id', tourId)
    .eq('artwork_id', artworkId);

  if (error) {
    console.error('[removeArtworkFromTour] fout delete:', error);
    throw new Error('Kon kunstwerk niet uit tour verwijderen');
  }

  revalidatePath(`/admin/tours/${tourId}`);
  revalidatePath('/tour/today');
}
