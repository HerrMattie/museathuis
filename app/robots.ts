import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = 'https://museathuis.nl'; // Pas aan naar je domein

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/crm/', '/profile/', '/favorites/'], // Privé pagina's niet indexeren
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
