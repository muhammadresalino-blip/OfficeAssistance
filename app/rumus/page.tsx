'use client';

import { useState, useCallback } from 'react';
import CopyButton from '@/components/CopyButton';
import FormulaForm from '@/components/FormulaForm';

export default function RumusPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text">Asisten Rumus Excel</h1>
        <p className="mt-1 text-textSecondary text-sm">
          Tulis kebutuhan Anda dalam bahasa Indonesia, dapatkan rumus siap salin beserta penjelasan dan contoh.
        </p>
      </header>

      <FormulaForm />

      <div className="mt-8 p-4 rounded-card border border-border bg-gray-50 text-xs text-textSecondary">
        <p className="font-medium text-text mb-1">Catatan penting</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Hasil rumus dihasilkan AI dan mungkin tidak selalu sempurna. Periksa kembali sebelum digunakan.</li>
          <li>Pilih pemisah rumus yang sesuai dengan pengaturan regional Excel Anda (koma atau titik koma).</li>
          <li>Batas: 20 permintaan AI per IP per hari. Kamus tetap dapat digunakan saat batas tercapai.</li>
        </ul>
      </div>
    </div>
  );
}
