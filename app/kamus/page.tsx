'use client';

import { useState, useMemo, useCallback } from 'react';
import formulas from '@/data/formulas.json';
import shortcuts from '@/data/shortcuts.json';
import tips from '@/data/tips.json';
import SearchBox from '@/components/SearchBox';
import ResultCard from '@/components/ResultCard';

type Entry = {
  id: string;
  app: 'excel' | 'word' | 'powerpoint';
  type: 'rumus' | 'shortcut' | 'tips';
  title: string;
  syntax: string;
  description: string;
  example: string;
  keywords: string[];
  minVersion?: string;
};

const allEntries: Entry[] = [
  ...(formulas as Entry[]),
  ...(shortcuts as Entry[]),
  ...(tips as Entry[]),
];

const appLabel: Record<Entry['app'], string> = {
  excel: 'Excel',
  word: 'Word',
  powerpoint: 'PowerPoint',
};

const typeLabel: Record<Entry['type'], string> = {
  rumus: 'Rumus',
  shortcut: 'Shortcut',
  tips: 'Tips',
};

export default function KamusPage() {
  const [query, setQuery] = useState('');
  const [appFilter, setAppFilter] = useState<Entry['app'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<Entry['type'] | 'all'>('all');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allEntries.filter((e) => {
      const matchQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q));
      const matchApp = appFilter === 'all' || e.app === appFilter;
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      return matchQuery && matchApp && matchType;
    });
  }, [query, appFilter, typeFilter]);

  const handleFilterChange = useCallback((key: 'app' | 'type', value: Entry['app'] | Entry['type'] | 'all') => {
    if (key === 'app') setAppFilter(value as Entry['app'] | 'all');
    else setTypeFilter(value as Entry['type'] | 'all');
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text">Kamus Rumus &amp; Shortcut</h1>
        <p className="mt-1 text-textSecondary text-sm">Cari instan rumus dan shortcut Excel, Word, PowerPoint. Bekerja offline setelah pemuatan pertama.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <p className="font-semibold text-text mb-3">Filter aplikasi</p>
            <div className="space-y-2">
              {(['all' as const, 'excel', 'word', 'powerpoint'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => handleFilterChange('app', a)}
                  className={`w-full text-left px-3 py-2 rounded-button border text-sm transition-colors ${
                    appFilter === a ? 'bg-primary text-white border-primary' : 'bg-card text-text border-inputBorder hover:bg-gray-100'
                  }`}
                >
                  {a === 'all' ? 'Semua' : appLabel[a]}
                </button>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-text mb-3">Filter jenis</p>
            <div className="space-y-2">
              {(['all' as const, 'rumus', 'shortcut', 'tips'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleFilterChange('type', t)}
                  className={`w-full text-left px-3 py-2 rounded-button border text-sm transition-colors ${
                    typeFilter === t ? 'bg-primary text-white border-primary' : 'bg-card text-text border-inputBorder hover:bg-gray-100'
                  }`}
                >
                  {t === 'all' ? 'Semua' : typeLabel[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="card p-4 text-xs text-textSecondary">
            <p className="font-medium text-text mb-1">Total entri</p>
            <p>{allEntries.length}</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <SearchBox
            placeholder="Cari rumus atau shortcut (contoh: jumlah, vlookup, simpan file)"
            value={query}
            onChange={setQuery}
          />
          <div className="text-xs text-textSecondary mb-2">
            Ditemukan <span className="font-semibold text-text">{results.length}</span> entri{' '}
            {query ? `untuk "${query}"` : ''}
          </div>
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="card p-6 text-center text-textSecondary">
                Tidak ditemukan. Coba kata kunci lain seperti "jumlah", "vlookup", atau "simpan".
              </div>
            ) : (
              results.map((entry) => (
                <ResultCard key={entry.id} entry={entry} appLabel={appLabel} typeLabel={typeLabel} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
