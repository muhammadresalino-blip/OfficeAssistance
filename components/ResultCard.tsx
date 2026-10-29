'use client';

import CopyButton from './CopyButton';

export interface ResultCardProps {
  entry: {
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
  appLabel: Record<string, string>;
  typeLabel: Record<string, string>;
}

const appColor: Record<string, string> = {
  excel: 'bg-excel text-white',
  word: 'bg-word text-white',
  powerpoint: 'bg-powerpoint text-white',
};

export default function ResultCard({ entry, appLabel, typeLabel }: ResultCardProps) {
  return (
    <article className="card flex flex-col sm:flex-row sm:items-start gap-3">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-button uppercase tracking-tighter ${appColor[entry.app]}`}>
          {appLabel[entry.app]}
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-button bg-gray-100 text-textSecondary uppercase tracking-tighter`}>
          {typeLabel[entry.type]}
        </span>
        {entry.minVersion && (
          <span className="text-[10px] font-medium text-textSecondary bg-gray-100 px-2 py-0.5 rounded-button uppercase tracking-tighter">
            {entry.minVersion}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text text-sm leading-snug">{entry.title}</h3>
        <p className="mt-1 text-sm text-textSecondary">{entry.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="mono text-xs">{entry.syntax}</span>
          <CopyButton text={entry.syntax} label="Salin sintaks" size="small" />
        </div>
        <p className="mt-2 text-xs text-textSecondary italic">Contoh: {entry.example}</p>
        {entry.keywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {entry.keywords.map((k) => (
              <span key={k} className="text-[10px] text-textSecondary bg-gray-50 px-1.5 py-0.5 rounded-button border border-border">
                #{k}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
