import { describe, it, expect } from 'vitest';
import { askJson } from '@/lib/claude';
import { FORMULA_PROMPT } from '@/lib/prompts/formula';
import { FormulaRes } from '@/lib/schemas';

const hasAI = Boolean(process.env.ANTHROPIC_API_KEY);

const cases = [
  { q: 'Hitung total penjualan Jakarta bulan Januari', expectContains: 'SUMIFS' },
  { q: 'Rata-rata nilai ujian siswa', expectContains: 'AVERAGE' },
  { q: 'Nilai tertinggi dalam kolom C', expectContains: 'MAX' },
  { q: 'Nilai terendah dalam kolom C', expectContains: 'MIN' },
  { q: 'Jika A2 sama dengan Jakarta tampilkan Ya', expectContains: 'IF' },
  { q: 'Cari harga barang berdasarkan kode', expectContains: 'VLOOKUP' },
  { q: 'Jumlahkan A1 sampai A10', expectContains: 'SUM' },
  { q: 'Hitung berapa kali Selesai muncul', expectContains: 'COUNTIF' },
  { q: 'Gabungkan nama depan dan nama belakang', expectContains: 'CONCATENATE' },
  { q: 'Hapus spasi berlebih dari teks', expectContains: 'TRIM' },
  { q: 'Tampilkan tanggal hari ini', expectContains: 'TODAY' },
  { q: 'Berikan rumus untuk jumlah penjualan', expectContains: 'SUM' },
  { q: 'Total belanjaan per kategori', expectContains: 'SUMIFS' },
  { q: 'Rata-rata pendapatan per bulan', expectContains: 'AVERAGE' },
  { q: 'Tanggal sekarang', expectContains: 'TODAY' },
  { q: 'Cari data vertikal dengan VLOOKUP', expectContains: 'VLOOKUP' },
  { q: 'Logika IF sederhana', expectContains: 'IF' },
  { q: 'Jumlah semua data penjualan', expectContains: 'SUM' },
  { q: 'Data paling tinggi bulan ini', expectContains: 'MAX' },
  { q: 'Data paling rendah bulan ini', expectContains: 'MIN' },
  { q: 'Hitung jumlah produk yang laku', expectContains: 'COUNTIF' },
  { q: 'Gabungkan teks sel A dan B', expectContains: 'CONCATENATE' },
  { q: 'Rapatkan spasi di teks', expectContains: 'TRIM' },
  { q: 'Berapa rata-rata penjualan harian', expectContains: 'AVERAGE' },
  { q: 'Total penjualan Jakarta', expectContains: 'SUMIFS' },
  { q: 'Cari nama pelanggan dengan ID', expectContains: 'VLOOKUP' },
  { q: 'Jika lalu maka', expectContains: 'IF' },
  { q: 'Maximal nilai dalam range', expectContains: 'MAX' },
  { q: 'Minimal nilai dalam range', expectContains: 'MIN' },
  { q: 'Jumlahkan seluruh kolom penjualan', expectContains: 'SUM' },
];

describe('Evaluasi prompt rumus (30 kasus)', () => {
  it('setiap kasus menghasilkan rumus yang valid sesuai skema', async () => {
    for (const c of cases) {
      const raw = await askJson(FORMULA_PROMPT, `Kebutuhan: ${c.q}\nPemisah: ;\nRentang: A2:C100\nBahasa: Indonesia`);
      const parsed = FormulaRes.safeParse(raw);
      expect(parsed.success).toBe(true);
      if (!parsed.success) {
        throw new Error(`Gagal validasi untuk: ${c.q}`);
      }
      if (parsed.success) {
        expect(parsed.data.formula.startsWith('=')).toBe(true);
        if (hasAI && c.expectContains) {
          expect(
            parsed.data.formula.toUpperCase().includes(c.expectContains),
            `Rumus untuk "${c.q}" seharusnya mengandung ${c.expectContains}`
          ).toBe(true);
        }
      }
    }
  }, 60000);
});
