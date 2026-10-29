'use client';

import { useState, useCallback } from 'react';
import CopyButton from './CopyButton';

export default function FormulaForm() {
  const [request, setRequest] = useState('');
  const [separator, setSeparator] = useState(';');
  const [range, setRange] = useState('');
  const [result, setResult] = useState<{
    formula: string;
    explanation: string[];
    example: { input: string; output: string };
    minVersion?: string;
    clarification?: string;
    rateLimitRemaining?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const validate = useCallback((): string | null => {
    const trimmed = request.trim();
    if (trimmed.length < 5) return 'Minimal 5 karakter.';
    if (trimmed.length > 500) return 'Maksimal 500 karakter.';
    return null;
  }, [request]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setRateLimited(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request,
          separator: separator as ',' | ';',
          range: range || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimited(true);
          setError(data.error?.message ?? 'Batas harian tercapai.');
        } else if (res.status === 502) {
          setError(data.error?.message ?? 'Coba ulangi permintaan.');
        } else if (res.status === 503) {
          setError(data.error?.message ?? 'Layanan AI sedang bermasalah.');
        } else {
          setError(data.error?.message ?? 'Terjadi kesalahan.');
        }
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = useCallback(() => onSubmit(new Event('submit') as unknown as React.FormEvent), [onSubmit]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form kolom kiri */}
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="label">Kebutuhan Anda</label>
            <textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Contoh: Hitung total penjualan Jakarta bulan Januari"
              rows={4}
              className="input"
              disabled={loading}
              aria-label="Kebutuhan rumus"
            />
            {error && !rateLimited && (
              <p className="text-[11px] text-red-600">{error}</p>
            )}
            <p className="text-[11px] text-textSecondary">
              {request.length} / 500 karakter
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="label">Pemisah rumus</label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value as ',' | ';')}
                className="input"
                disabled={loading}
                aria-label="Pemisah rumus"
              >
                <option value=";">Titik koma (;)</option>
                <option value=",">Koma (,)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="label">Rentang data (opsional)</label>
              <input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="A2:C100"
                className="input"
                disabled={loading}
                aria-label="Rentang data opsional"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || rateLimited}
            className="w-full btn-primary touch-target"
          >
            {loading ? 'Memproses...' : 'Buat rumus'}
          </button>
        </form>

        {error && rateLimited && (
          <div className="p-3 rounded-button bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
            <p className="mt-1 text-[11px] text-red-600">
              Kamus tetap bisa digunakan. Batas akan reset besok.
            </p>
          </div>
        )}
        {error && !rateLimited && (
          <div className="p-3 rounded-button bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 inline-block text-sm underline text-primary"
            >
              Ulangi permintaan
            </button>
          </div>
        )}
      </div>

      {/* Hasil kolom kanan */}
      <div className="lg:col-span-5 space-y-4">
        {result ? (
          <article className="card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-text text-sm">Rumus</h2>
                <p className="text-[11px] text-textSecondary mt-1">Siap disalin ke Excel</p>
              </div>
              <CopyButton text={result.formula} label="Salin rumus" />
            </div>
            <div className="mono text-sm overflow-x-auto border border-border rounded-button p-3 bg-card">
              {result.formula}
            </div>
            <div>
              <h3 className="font-bold text-text text-sm mb-2">Penjelasan</h3>
              <ol className="list-decimal list-inside text-sm text-text space-y-1">
                {result.explanation.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ol>
            </div>
            <div className="pt-2 border-t border-border">
              <h3 className="font-bold text-text text-sm mb-2">Contoh</h3>
              <p className="text-sm text-textSecondary">Input: {result.example.input}</p>
              <p className="text-sm text-text">Output: {result.example.output}</p>
            </div>
            {result.minVersion && (
              <p className="text-[11px] text-textSecondary italic">Versi Excel: {result.minVersion}</p>
            )}
            <p className="text-[11px] text-textSecondary italic mt-2">
              Catatan: hasil dihasilkan AI, periksa kembali sebelum digunakan.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 btn-outline text-sm touch-target">Berguna 👍</button>
              <button className="flex-1 btn-outline text-sm touch-target">Kurang tepat 👎</button>
            </div>
          </article>
        ) : (
          <article className="card p-6 text-center text-textSecondary">
            <p className="text-sm">Hasil rumus akan muncul di sini</p>
            <p className="text-[11px] mt-1">Isi kebutuhan lalu klik Buat rumus</p>
          </article>
        )}
      </div>
    </div>
  );
}
