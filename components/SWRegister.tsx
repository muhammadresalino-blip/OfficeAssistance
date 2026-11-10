'use client';

import { useEffect } from 'react';

/** Daftarkan service worker agar kamus & halaman bisa dipakai offline. */
export default function SWRegister() {
  useEffect(() => {
    // Hanya di production: di dev, cache SW akan menyembunyikan hasil edit.
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline tidak wajib; abaikan jika gagal */
    });
  }, []);

  return null;
}
