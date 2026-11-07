import { describe, it, expect } from 'vitest';
import { FormulaReq, FormulaRes, DictionaryQuery, CleanSuggestReq, CleanSuggestRes } from '@/lib/schemas';

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
