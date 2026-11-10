import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Office Assistant — Asisten Excel, Word, PowerPoint',
    short_name: 'Office Assistant',
    description:
      'Aplikasi web produktivitas kerja berbahasa Indonesia. Gratis, tanpa login, tanpa iklan.',
    lang: 'id',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F5F0',
    theme_color: '#1D6F42',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
