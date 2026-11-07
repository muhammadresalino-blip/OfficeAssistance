'use client';

import { useMemo, useState } from 'react';
import {
  DEFAULT_CLEAN_OPTIONS,
  MAX_ROWS,
  analyzeIssues,
  cleanRows,
  parseText,
  takeSample,
  toCsv,
  type CleanOptions,
  type IssueCode,
} from '@/lib/cleaners';

interface AiResult {
  steps: string[];
  formulas: { purpose: string; formula: string }[];
  rateLimitRemaining?: number;
}

const AUTO_FIX: Partial<Record<IssueCode, keyof CleanOptions>> = {
  extra_space: 'trim',
  duplicate: 'dedupe',
  mixed_date: 'normalizeDates',
  uneven_columns: 'padColumns',
};

const EXAMPLE = `Nama,Kota,Tanggal
Budi Santoso,  Jakarta ,12/01/24
budi santoso,Jakarta,2024-01-12
Sari, Bandung,15/02/24
"Rina, S.Pd",Surabaya,2024-03-01`;

export default function BersihkanPage() {
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<string[][] | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_CLEAN_OPTIONS);

  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const issues = useMemo(() => (parsed ? analyzeIssues(parsed) : []), [parsed]);
  const cleaned = useMemo(
    () => (parsed ? cleanRows(parsed, options) : null),
    [parsed, options]
  );

  const handleParse = () => {
    setAiResult(null);
    setAiError(null);

    if (raw.trim() === '') {
      setParsed(null);
      setTruncated(false);
      setError('Tempel data terlebih dahulu.');
      return;
    }

    const rows = parseText(raw);
    if (rows.length === 0) {
      setParsed(null);
      setTruncated(false);
      setError('Tidak ada baris data yang dapat dibaca.');
      return;
    }

    const lineCount = raw
      .replace(/^\uFEFF/, '')
      .split(/\r\n?|\n/)
      .filter((line) => line.trim() !== '').length;

    setError(null);
    setParsed(rows);
    setTruncated(lineCount > MAX_ROWS);
  };

  const toggleOption = (key: keyof CleanOptions) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleDownload = () => {
    if (!cleaned || cleaned.rows.length === 0) return;

    const csv = `\uFEFF${toCsv(cleaned.rows)}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-bersih.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAskAi = async () => {
    if (!parsed || issues.length === 0) return;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch('/api/clean/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sample: takeSample(parsed),
          issues: issues.map((issue) => issue.code),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error?.message ?? 'Gagal meminta saran AI.');
        return;
      }

      setAiResult(data);
    } catch {
      setAiError('Tidak dapat terhubung ke server. Perbaikan lokal tetap bisa digunakan.');
    } finally {
      setAiLoading(false);
    }
  };

  const previewRows = cleaned ? cleaned.rows.slice(0, 51) : [];
  const header = previewRows[0] ?? [];
  const bodyRows = previewRows.slice(1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text">Pembersih Data</h1>
        <p className="mt-1 text-textSecondary text-sm">
          Tempel data dari Excel (tab) atau CSV. Deteksi dan perbaiki masalah langsung di browser — data tidak
          dikirim ke server kecuali Anda meminta saran AI.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input */}
        <section className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="data-input" className="label mb-0">
              Data mentah
            </label>
            <button
              type="button"
              className="btn-text text-xs"
              onClick={() => setRaw(EXAMPLE)}
            >
              Isi contoh
            </button>
          </div>

          <textarea
            id="data-input"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            rows={12}
            placeholder={'Nama\tKota\tTanggal\nBudi Santoso\tJakarta\t12/01/24'}
            className="input font-mono text-xs"
            aria-describedby="data-hint"
          />
          <p id="data-hint" className="text-[11px] text-textSecondary">
            Maksimal {MAX_ROWS.toLocaleString('id-ID')} baris. Pemisah tab, koma, atau titik koma dideteksi
            otomatis.
          </p>

          <button type="button" onClick={handleParse} className="w-full btn-primary touch-target">
            Deteksi masalah
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {truncated && (
            <p className="p-3 rounded-button bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs">
              Data lebih dari {MAX_ROWS.toLocaleString('id-ID')} baris. Hanya bagian pertama yang diproses.
            </p>
          )}

          {parsed && (
            <div className="card text-sm space-y-1">
              <p className="font-medium text-text">Ringkasan data</p>
              <p className="text-textSecondary">
                {parsed.length.toLocaleString('id-ID')} baris &bull; {header.length} kolom terdeteksi
              </p>
              <p className="text-textSecondary">
                {issues.length === 0
                  ? 'Tidak ada masalah yang terdeteksi.'
                  : `${issues.length} jenis masalah ditemukan.`}
              </p>
            </div>
          )}
        </section>

        {/* Masalah & perbaikan */}
        <section className="lg:col-span-7 space-y-4">
          {!parsed ? (
            <article className="card p-6 text-center text-textSecondary">
              <p className="text-sm">Daftar masalah dan pratinjau akan muncul di sini.</p>
              <p className="text-[11px] mt-1">Tempel data lalu klik Deteksi masalah.</p>
            </article>
          ) : (
            <>
              <article className="card space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold text-text text-sm">Masalah terdeteksi</h2>
                  <span className="text-[11px] text-textSecondary">{issues.length} jenis</span>
                </div>

                {issues.length === 0 ? (
                  <p className="text-sm text-textSecondary">Data sudah rapi. Anda bisa langsung mengunduh CSV.</p>
                ) : (
                  <ul className="space-y-2">
                    {issues.map((issue) => {
                      const fixKey = AUTO_FIX[issue.code];
                      return (
                        <li
                          key={issue.code}
                          className="p-3 rounded-button border border-border bg-gray-50 text-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-text">
                                {issue.label}{' '}
                                <span className="text-textSecondary font-normal">({issue.count})</span>
                              </p>
                              <p className="text-textSecondary text-xs mt-0.5">{issue.description}</p>
                              <p className="text-textSecondary text-xs mt-1">
                                Manual di Excel: {issue.manual}
                              </p>
                            </div>
                            {fixKey && (
                              <label className="flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={options[fixKey]}
                                  onChange={() => toggleOption(fixKey)}
                                  className="accent-primary h-4 w-4"
                                />
                                Perbaiki
                              </label>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {issues.some((issue) => issue.code === 'merged_column') && (
                  <p className="text-[11px] text-textSecondary">
                    Kolom gabungan belum dapat dipisah otomatis. Gunakan langkah manual di Excel.
                  </p>
                )}
              </article>

              <article className="card space-y-3">
                <h2 className="font-bold text-text text-sm">Perbaikan lokal</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {[
                    { key: 'trim' as const, label: 'Rapikan spasi' },
                    { key: 'dedupe' as const, label: 'Hapus duplikat' },
                    { key: 'normalizeDates' as const, label: 'Seragamkan tanggal (YYYY-MM-DD)' },
                    { key: 'padColumns' as const, label: 'Samakan jumlah kolom' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options[item.key]}
                        onChange={() => toggleOption(item.key)}
                        className="accent-primary h-4 w-4"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
                {cleaned && (
                  <p className="text-[11px] text-textSecondary">
                    Hasil: {cleaned.rows.length.toLocaleString('id-ID')} baris
                    {cleaned.removed > 0 ? `, ${cleaned.removed} duplikat dihapus` : ''}.
                  </p>
                )}
              </article>

              <article className="card space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold text-text text-sm">Pratinjau hasil bersih</h2>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!cleaned || cleaned.rows.length === 0}
                    className="btn-outline text-xs"
                  >
                    Unduh CSV
                  </button>
                </div>

                {cleaned && cleaned.rows.length > 0 ? (
                  <div className="overflow-x-auto border border-border rounded-button">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          {header.map((cell, index) => (
                            <th
                              key={index}
                              scope="col"
                              className="px-2 py-1.5 text-left font-semibold text-text whitespace-nowrap border-b border-border"
                            >
                              {cell || `Kolom ${index + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bodyRows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="odd:bg-white even:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-2 py-1.5 text-textSecondary whitespace-nowrap border-b border-border"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-textSecondary">Tidak ada data untuk ditampilkan.</p>
                )}

                {cleaned && cleaned.rows.length > 51 && (
                  <p className="text-[11px] text-textSecondary">
                    Menampilkan 50 baris pertama. Unduh CSV untuk data lengkap.
                  </p>
                )}
              </article>

              <article className="card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-text text-sm">Saran AI (opsional)</h2>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      Hanya {takeSample(parsed).length} baris contoh yang dikirim ke server.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAskAi}
                    disabled={aiLoading || issues.length === 0}
                    className="btn-primary text-xs"
                  >
                    {aiLoading ? 'Memproses...' : 'Minta saran AI'}
                  </button>
                </div>

                {issues.length === 0 && (
                  <p className="text-[11px] text-textSecondary">
                    Saran AI tersedia setelah ada masalah yang terdeteksi.
                  </p>
                )}

                {aiError && <p className="text-sm text-red-600">{aiError}</p>}

                {aiResult && (
                  <div className="space-y-3 text-sm">
                    <div>
                      <h3 className="font-medium text-text mb-1">Langkah manual</h3>
                      <ol className="list-decimal list-inside space-y-1 text-textSecondary">
                        {aiResult.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {aiResult.formulas.length > 0 && (
                      <div>
                        <h3 className="font-medium text-text mb-1">Rumus alternatif</h3>
                        <ul className="space-y-2">
                          {aiResult.formulas.map((item, index) => (
                            <li key={index}>
                              <p className="text-textSecondary text-xs">{item.purpose}</p>
                              <code className="mono block mt-1 overflow-x-auto">{item.formula}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-[11px] text-textSecondary italic">
                      Saran dihasilkan AI. Periksa kembali sebelum diterapkan.
                    </p>
                  </div>
                )}
              </article>
            </>
          )}
        </section>
      </div>

      <div className="mt-8 p-4 rounded-card border border-border bg-gray-50 text-xs text-textSecondary">
        <p className="font-medium text-text mb-1">Privasi</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Parsing, deteksi, dan perbaikan berjalan sepenuhnya di browser Anda.</li>
          <li>Data tidak disimpan di server. Saran AI hanya mengirim maksimal 20 baris contoh.</li>
          <li>Batas saran AI: 20 permintaan per IP per hari.</li>
        </ul>
      </div>
    </div>
  );
}
