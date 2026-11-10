'use client';

import { useEffect } from 'react';

/** Daftarkan service worker agar kamus & halaman bisa dipakai offline. */
export default function SWRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline tidak wajib; abaikan jika gagal */
    });
  }, []);

  return null;
}
