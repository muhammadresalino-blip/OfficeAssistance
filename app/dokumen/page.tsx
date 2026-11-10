'use client';

import { useState } from 'react';
import CopyButton from '@/components/CopyButton';
import LoadingSkeleton from '@/components/LoadingSkeleton';

type Section = { heading: string; content: string };

export default function DokumenPage() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('surat_resmi');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sections: Section[]; tips?: string[] } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/doc-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, purpose }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else alert(data.error?.message ?? 'Gagal membuat kerangka.');
    } catch (err) {
      alert('Gagal membuat kerangka.');
    } finally {
      setLoading(false);
    }
  };

  const downloadDocx = async () => {
    if (!result) return;
    const [{ Document, Packer, Paragraph, HeadingLevel, TextRun }, { saveAs }] = await Promise.all([
      import('docx'),
      import('file-saver'),
    ]);
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.HEADING_1, spacing: { after: 400 } }),
          ...result.sections.flatMap(s => [
            new Paragraph({ text: s.heading, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            new Paragraph({ children: [new TextRun(s.content)] })
          ])
        ]
      }]
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title}.docx`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Kerangka Dokumen</h1>
        <p className="text-textSecondary">Buat draf surat atau laporan profesional dalam hitungan detik.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={onSubmit} className="card space-y-4 h-fit">
          <div>
            <label htmlFor="doc-type" className="label">Jenis Dokumen</label>
            <select id="doc-type" value={type} onChange={e => setType(e.target.value)} className="input">
              <option value="surat_resmi">Surat Resmi</option>
              <option value="laporan">Laporan</option>
              <option value="notulen">Notulen Rapat</option>
              <option value="proposal">Proposal</option>
            </select>
          </div>
          <div>
            <label htmlFor="doc-title" className="label">Judul/Perihal</label>
            <input id="doc-title" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Contoh: Undangan Rapat RT" required />
          </div>
          <div>
            <label htmlFor="doc-purpose" className="label">Tujuan Singkat</label>
            <textarea id="doc-purpose" value={purpose} onChange={e => setPurpose(e.target.value)} className="input" rows={3} placeholder="Apa inti dari dokumen ini?" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Buat Kerangka'}
          </button>
          <p className="text-[11px] text-textSecondary">
            Data tidak disimpan. Jangan masukkan NIK, nomor rekening, atau kata sandi.
          </p>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div className="card">
              <LoadingSkeleton lines={8} label="Menyusun kerangka dokumen..." />
            </div>
          ) : result ? (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Hasil Kerangka</h2>
                <button onClick={downloadDocx} className="btn-outline text-xs">Unduh .docx</button>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {result.sections.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <h3 className="font-semibold text-sm">{s.heading}</h3>
                        <CopyButton text={s.content} size="small" />
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap text-textSecondary">{s.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card h-64 flex items-center justify-center text-textSecondary text-sm">
              Hasil akan muncul di sini
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
