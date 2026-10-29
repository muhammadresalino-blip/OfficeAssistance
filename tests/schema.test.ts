import { describe, it, expect } from 'vitest';
import { FormulaReq, FormulaRes, DictionaryQuery } from '@/lib/schemas';

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
