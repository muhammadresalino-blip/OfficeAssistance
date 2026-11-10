import { describe, it, expect } from 'vitest';
import {
  FormulaReq,
  FormulaRes,
  DictionaryQuery,
  CleanSuggestReq,
  CleanSuggestRes,
  DocOutlineReq,
  DocOutlineRes,
  SlideOutlineReq,
  SlideOutlineRes,
} from '@/lib/schemas';

describe('FormulaReq', () => {
  it('terima input valid', () => {
    const parsed = FormulaReq.safeParse({ request: 'Hitung total penjualan', separator: ';', range: 'A2:C100' });
    expect(parsed.success).toBe(true);
  });

  it('tolak input terlalu pendek', () => {
    const parsed = FormulaReq.safeParse({ request: 'hi' });
    expect(parsed.success).toBe(false);
  });

  it('default separator titik koma', () => {
    const parsed = FormulaReq.safeParse({ request: 'Hitung total penjualan' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.separator).toBe(';');
  });
});

describe('FormulaRes', () => {
  it('terima respons valid', () => {
    const parsed = FormulaRes.safeParse({
      formula: '=SUM(A2:A100)',
      explanation: ['Menjumlahkan kolom A'],
      example: { input: '10, 20', output: '30' },
    });
    expect(parsed.success).toBe(true);
  });

  it('tolak explanation kosong', () => {
    const parsed = FormulaRes.safeParse({
      formula: '=SUM(A2:A100)',
      explanation: [],
      example: { input: '10', output: '10' },
    });
    expect(parsed.success).toBe(false);
  });
});

describe('DictionaryQuery', () => {
  it('default limit 20', () => {
    const parsed = DictionaryQuery.safeParse({ q: 'jumlah' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.limit).toBe(20);
  });
});

describe('CleanSuggestReq', () => {
  it('menerima maksimal 20 baris contoh', () => {
    const sample = Array.from({ length: 20 }, (_, index) => [`baris ${index + 1}`, 'x']);
    const parsed = CleanSuggestReq.safeParse({ sample, issues: ['duplicate', 'extra_space'] });
    expect(parsed.success).toBe(true);
  });

  it('menolak lebih dari 20 baris contoh', () => {
    const sample = Array.from({ length: 21 }, (_, index) => [`baris ${index + 1}`]);
    const parsed = CleanSuggestReq.safeParse({ sample, issues: ['duplicate'] });
    expect(parsed.success).toBe(false);
  });

  it('menolak kode masalah yang tidak dikenal', () => {
    const parsed = CleanSuggestReq.safeParse({
      sample: [['Budi']],
      issues: ['tidak_dikenal'],
    });
    expect(parsed.success).toBe(false);
  });

  it('menolak contoh kosong', () => {
    const parsed = CleanSuggestReq.safeParse({ sample: [], issues: ['duplicate'] });
    expect(parsed.success).toBe(false);
  });
});

describe('CleanSuggestRes', () => {
  it('default formulas menjadi array kosong', () => {
    const parsed = CleanSuggestRes.safeParse({ steps: ['Rapikan spasi'] });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.formulas).toEqual([]);
  });

  it('menolak steps kosong', () => {
    const parsed = CleanSuggestRes.safeParse({ steps: [], formulas: [] });
    expect(parsed.success).toBe(false);
  });
});

describe('DocOutlineReq', () => {
  it('menerima input valid', () => {
    const parsed = DocOutlineReq.safeParse({
      type: 'surat_resmi',
      title: 'Undangan rapat RT',
      purpose: 'Mengundang warga untuk rapat bulanan',
      organization: 'RT 004',
    });
    expect(parsed.success).toBe(true);
  });

  it('menolak jenis dokumen yang tidak dikenal', () => {
    const parsed = DocOutlineReq.safeParse({ type: 'surat_cinta', title: 'Undangan rapat', purpose: 'Mengundang warga' });
    expect(parsed.success).toBe(false);
  });

  it('menolak judul terlalu pendek', () => {
    const parsed = DocOutlineReq.safeParse({ type: 'laporan', title: 'ab', purpose: 'Laporan penjualan triwulan' });
    expect(parsed.success).toBe(false);
  });
});

describe('DocOutlineRes', () => {
  it('membutuhkan minimal 2 bagian', () => {
    expect(DocOutlineRes.safeParse({ sections: [{ heading: 'a', content: 'b' }] }).success).toBe(false);
    expect(
      DocOutlineRes.safeParse({
        sections: [
          { heading: 'a', content: 'b' },
          { heading: 'c', content: 'd' },
        ],
      }).success
    ).toBe(true);
  });
});

describe('SlideOutlineReq', () => {
  it('default 10 slide dan coercing angka string', () => {
    const parsed = SlideOutlineReq.safeParse({ topic: 'Strategi pemasaran digital', audience: 'Manajemen', slides: '12' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.slides).toBe(12);

    const withDefault = SlideOutlineReq.safeParse({ topic: 'Strategi pemasaran digital', audience: 'Manajemen' });
    if (withDefault.success) expect(withDefault.data.slides).toBe(10);
  });

  it('menolak jumlah slide di luar 5-20', () => {
    const base = { topic: 'Strategi pemasaran digital', audience: 'Manajemen' };
    expect(SlideOutlineReq.safeParse({ ...base, slides: 3 }).success).toBe(false);
    expect(SlideOutlineReq.safeParse({ ...base, slides: 25 }).success).toBe(false);
  });
});

describe('SlideOutlineRes', () => {
  it('menerima daftar slide valid (minimal 5)', () => {
    const parsed = SlideOutlineRes.safeParse({
      slides: [
        { no: 1, title: 'Judul', bullets: ['poin 1'] },
        { no: 2, title: 'Latar Belakang', bullets: ['poin 2'], visual: 'grafik' },
        { no: 3, title: 'Isi', bullets: ['poin 3'] },
        { no: 4, title: 'Kesimpulan', bullets: ['poin 4'] },
        { no: 5, title: 'Penutup', bullets: ['poin 5'] },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it('menolak kurang dari 5 slide', () => {
    const parsed = SlideOutlineRes.safeParse({
      slides: [
        { no: 1, title: 'Judul', bullets: ['poin 1'] },
        { no: 2, title: 'Isi', bullets: ['poin 2'] },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it('menolak slide tanpa poin', () => {
    const parsed = SlideOutlineRes.safeParse({
      slides: [
        { no: 1, title: 'Judul', bullets: [] },
        { no: 2, title: 'A', bullets: ['x'] },
        { no: 3, title: 'B', bullets: ['x'] },
        { no: 4, title: 'C', bullets: ['x'] },
        { no: 5, title: 'D', bullets: ['x'] },
      ],
    });
    expect(parsed.success).toBe(false);
  });
});
