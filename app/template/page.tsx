import Link from 'next/link';
import templates from '@/data/templates.json';

const FORMAT_LABEL: Record<string, string> = {
  xlsx: 'Excel (.xlsx)',
  docx: 'Word (.docx)',
  pptx: 'PowerPoint (.pptx)',
};

/** Pratinjau mini per format, murni CSS tanpa file eksternal. */
function FormatPreview({ format }: { format: string }) {
  if (format === 'xlsx') {
    return (
      <div className="aspect-[4/3] w-full rounded-button border border-border bg-card p-2">
        <div className="grid h-full grid-cols-4 grid-rows-6 gap-px overflow-hidden bg-border">
          {Array.from({ length: 24 }, (_, index) => (
            <div key={index} className={`${index < 4 ? 'bg-excel/80' : 'bg-card'} h-full w-full`} />
          ))}
        </div>
      </div>
    );
  }

  if (format === 'docx') {
    return (
      <div className="aspect-[4/3] w-full rounded-button border border-border bg-card p-3 space-y-2">
        <div className="h-3 w-2/3 rounded bg-word/70" />
        <div className="h-2 w-full rounded bg-gray-200" />
        <div className="h-2 w-5/6 rounded bg-gray-200" />
        <div className="h-2 w-full rounded bg-gray-200" />
        <div className="h-2 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-word/40 pt-2" />
        <div className="h-2 w-full rounded bg-gray-200" />
        <div className="h-2 w-2/3 rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] w-full rounded-button border border-border bg-card p-2">
      <div className="flex h-full flex-col gap-2">
        <div className="h-1/2 rounded bg-powerpoint/80" />
        <div className="flex flex-1 flex-col justify-center gap-1.5 px-4">
          <div className="h-2 w-4/5 rounded bg-gray-200" />
          <div className="h-2 w-3/5 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function TemplatePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-text">Template Gratis</h1>
        <p className="mt-1 text-textSecondary text-sm">
          Unduh template siap pakai untuk Excel, Word, dan PowerPoint. Tanpa login, tanpa biaya.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <article key={template.id} className="card flex flex-col gap-3">
            <FormatPreview format={template.format} />
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold text-text">{template.name}</h2>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-textSecondary">
                  {FORMAT_LABEL[template.format] ?? template.format}
                </span>
              </div>
              <p className="mt-1 text-sm text-textSecondary">{template.description}</p>
            </div>
            <a href={template.downloadUrl} className="btn-primary mt-auto w-full" download>
              Unduh {template.format.toUpperCase()}
            </a>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-card border border-border bg-gray-50 p-4 text-xs text-textSecondary">
        <p className="font-medium text-text">Cara pakai</p>
        <ul className="mt-1 list-disc list-inside space-y-1 text-sm">
          <li>File diunduh sesuai format aslinya (bukan gambar), langsung bisa dibuka di Office.</li>
          <li>Tanda kurung siku <code className="mono">[...]</code> menandakan bagian yang perlu Anda isi.</li>
          <li>Lihat fitur lain di <Link href="/" className="text-primary underline">beranda</Link>.</li>
        </ul>
      </div>
    </div>
  );
}
