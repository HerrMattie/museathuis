import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MuseaThuis Premium',
    short_name: 'MuseaThuis',
    description: 'Dagelijkse kunstgeschiedenis en audiotours.',
    start_url: '/',
    display: 'standalone', // Dit verbergt de browserbalk (URL balk)
    background_color: '#020617', // Midnight-950
    theme_color: '#020617',
    icons: [
      {
        src: '/icon.png', // Zorg dat je een icon.png in je 'public' map zet!
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
