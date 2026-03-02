import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tribal Trend',
    short_name: 'Tribal',
    description: 'Tienda de artesanías y decoración hecha a mano.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f3e7',
    theme_color: '#7a4a2b',
    icons: [
      {
        src: '/icons/logo_tribal_trnasparente.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/logo_tribal_trnasparente.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
