'use client';

import { useState } from 'react';
import CopyButton from '@/components/CopyButton';
import LoadingSkeleton from '@/components/LoadingSkeleton';

type Slide = { no: number; title: string; bullets: string[]; visual?: string };

export default function PresentasiPage() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ slides: Slide[] } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/slide-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, audience, slides: slideCount }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else alert(data.error?.message ?? 'Gagal membuat outline.');
    } catch (err) {
      alert('Gagal membuat outline.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPptx = async () => {
    if (!result) return;
    const { default: pptxgen } = await import('pptxgenjs');
    const pres = new pptxgen();
    result.slides.forEach(s => {
      const slide = pres.addSlide();
      slide.addText(s.title, { x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: '363636' });
      slide.addText(s.bullets.join('\n'), { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '666666', bullet: true });
      if (s.visual) {
          slide.addText(`Visual: ${s.visual}`, { x: 0.5, y: 5.0, fontSize: 12, italic: true, color: '999999' });
      }
    });
    pres.writeFile({ fileName: `${topic}.pptx` });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Outline Presentasi</h1>
        <p className="text-textSecondary">Ubah topik menjadi struktur slide yang memukau dalam sekejap.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={onSubmit} className="lg:col-span-4 card space-y-4 h-fit">
          <div>
            <label htmlFor="slide-topic" className="label">Topik Presentasi</label>
            <input id="slide-topic" value={topic} onChange={e => setTopic(e.target.value)} className="input" placeholder="Contoh: Strategi Pemasaran Digital" required />
          </div>
          <div>
            <label htmlFor="slide-audience" className="label">Audiens</label>
            <input id="slide-audience" value={audience} onChange={e => setAudience(e.target.value)} className="input" placeholder="Contoh: Manajemen Senior" required />
          </div>
          <div>
            <label htmlFor="slide-count" className="label">Jumlah Slide</label>
            <input id="slide-count" type="number" min={5} max={20} value={slideCount} onChange={e => setSlideCount(Number(e.target.value))} className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Buat Outline'}
          </button>
          <p className="text-[11px] text-textSecondary">
            Data tidak disimpan. Jangan masukkan NIK, nomor rekening, atau kata sandi.
          </p>
        </form>

        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="card">
              <LoadingSkeleton lines={10} label="Menyusun outline presentasi..." />
            </div>
          ) : result ? (
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold">Daftar Slide</h2>
                <button onClick={downloadPptx} className="btn-outline text-xs">Unduh .pptx</button>
              </div>
              <div className="space-y-6">
                {result.slides.map((s) => (
                  <div key={s.no} className="border-l-4 border-primary pl-4 py-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{s.no}. {s.title}</h3>
                        <CopyButton text={`${s.title}\n${s.bullets.join('\n')}`} size="small" />
                    </div>
                    <ul className="list-disc list-inside text-sm text-textSecondary space-y-1 mb-2">
                      {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                    {s.visual && (
                      <p className="text-xs text-primary italic bg-primary/5 p-2 rounded">
                        Saran Visual: {s.visual}
                      </p>
                    )}
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
