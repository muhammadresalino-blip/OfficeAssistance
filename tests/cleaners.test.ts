import { describe, it, expect } from 'vitest';
import {
  analyzeIssues,
  cleanRows,
  detectIssues,
  normalizeDates,
  padColumns,
  parseText,
  removeDuplicates,
  takeSample,
  toCsv,
  trimAll,
} from '@/lib/cleaners';

describe('parseText', () => {
  it('membaca data dengan pemisah tab', () => {
    const rows = parseText('Nama\tKota\nBudi\tJakarta');
    expect(rows).toEqual([
      ['Nama', 'Kota'],
      ['Budi', 'Jakarta'],
    ]);
  });

  it('membaca CSV dengan tanda kutip', () => {
    const rows = parseText('Nama,Kota\n"Rina, S.Pd",Surabaya');
    expect(rows[1]).toEqual(['Rina, S.Pd', 'Surabaya']);
  });

  it('mendukung tanda kutip ganda yang di-escape', () => {
    const rows = parseText('Nama,Kota\n"Kata ""halo""",Bandung');
    expect(rows[1]).toEqual(['Kata "halo"', 'Bandung']);
  });

  it('mendeteksi pemisah titik koma', () => {
    const rows = parseText('Nama;Kota\nBudi;Jakarta');
    expect(rows).toEqual([
      ['Nama', 'Kota'],
      ['Budi', 'Jakarta'],
    ]);
  });

  it('menghapus BOM dan baris kosong', () => {
    const rows = parseText('\uFEFFNama,Kota\n\nBudi,Jakarta\n   \n');
    expect(rows).toEqual([
      ['Nama', 'Kota'],
      ['Budi', 'Jakarta'],
    ]);
  });

  it('membatasi jumlah baris sesuai limit', () => {
    const text = Array.from({ length: 2500 }, (_, index) => `Baris ${index + 1}`).join('\n');
    expect(parseText(text)).toHaveLength(2000);
    expect(parseText(text, 3)).toHaveLength(3);
  });

  it('mengembalikan array kosong untuk teks kosong', () => {
    expect(parseText('   \n  ')).toEqual([]);
  });
});

describe('toCsv', () => {
  it('meng-escape koma dan tanda kutip', () => {
    const csv = toCsv([
      ['Budi', 'Jakarta, ID'],
      ['Rina "S.Pd"', 'x'],
    ]);
    expect(csv).toBe('Budi,"Jakarta, ID"\r\n"Rina ""S.Pd""",x');
  });
});

describe('takeSample', () => {
  it('mengambil maksimal 20 baris contoh', () => {
    const rows = Array.from({ length: 25 }, (_, index) => [`Baris ${index + 1}`]);
    expect(takeSample(rows)).toHaveLength(20);
    expect(takeSample(rows)[0]).toEqual(['Baris 1']);
  });
});

describe('trimAll', () => {
  it('menghapus spasi berlebih dan trim tiap sel', () => {
    const rows = [
      ['  Budi   Santoso ', ' Jakarta  '],
      ['  Sari ', 'Bandung'],
    ];
    expect(trimAll(rows)).toEqual([
      ['Budi Santoso', 'Jakarta'],
      ['Sari', 'Bandung'],
    ]);
  });
});

describe('removeDuplicates', () => {
  it('menghapus baris duplikat case-insensitive', () => {
    const rows = [
      ['Budi', 'Jakarta'],
      ['budi', 'jakarta'],
      ['Sari', 'Bandung'],
    ];
    expect(removeDuplicates(rows)).toEqual([
      ['Budi', 'Jakarta'],
      ['Sari', 'Bandung'],
    ]);
  });
});

describe('normalizeDates', () => {
  it('mengubah dd/mm/yy menjadi ISO dan membiarkan ISO', () => {
    const rows = [['12/01/24', '2024-02-03', '1.2.2023']];
    expect(normalizeDates(rows)).toEqual([['2024-01-12', '2024-02-03', '2023-02-01']]);
  });
});

describe('padColumns', () => {
  it('menambahkan sel kosong agar jumlah kolom sama', () => {
    expect(padColumns([['a', 'b'], ['c'], ['d', 'e', 'f']])).toEqual([
      ['a', 'b', ''],
      ['c', '', ''],
      ['d', 'e', 'f'],
    ]);
  });
});

describe('cleanRows', () => {
  it('menerapkan perbaikan berurutan dan menghitung duplikat', () => {
    const rows = [
      [' Budi ', 'Jakarta'],
      ['budi', 'Jakarta'],
      ['Sari'],
    ];
    const result = cleanRows(rows, { trim: true, dedupe: true, padColumns: true });
    expect(result.rows).toEqual([
      ['Budi', 'Jakarta'],
      ['Sari', ''],
    ]);
    expect(result.removed).toBe(1);
  });
});

describe('detectIssues', () => {
  it('mendeteksi duplikat', () => {
    const rows = [
      ['Budi', '12/01/24'],
      ['budi', '12/01/24'],
    ];
    expect(detectIssues(rows)).toContain('duplicate');
  });

  it('mendeteksi spasi berlebih', () => {
    expect(detectIssues([['Budi  ', 'Jakarta']])).toContain('extra_space');
  });

  it('mendeteksi kolom gabungan', () => {
    const rows = [['Nama'], ['Budi, Jakarta'], ['Sari, Bandung'], ['Rina, Surabaya']];
    expect(detectIssues(rows)).toContain('merged_column');
  });

  it('mendeteksi format tanggal campur', () => {
    expect(detectIssues([['12/01/24', '2024-01-12']])).toContain('mixed_date');
  });

  it('mendeteksi jumlah kolom tidak rata', () => {
    const rows = [
      ['Nama', 'Kota'],
      ['Budi', 'Jakarta'],
      ['Sari'],
    ];
    expect(detectIssues(rows)).toContain('uneven_columns');
  });

  it('mengembalikan array kosong jika tidak ada masalah', () => {
    const rows = [
      ['Budi', 'Jakarta'],
      ['Sari', 'Bandung'],
    ];
    expect(detectIssues(rows)).toEqual([]);
  });
});

describe('analyzeIssues', () => {
  it('menghitung jumlah baris duplikat', () => {
    const rows = [
      ['Budi', 'Jakarta'],
      ['budi', 'jakarta'],
      ['Sari', 'Bandung'],
    ];
    const duplicate = analyzeIssues(rows).find((issue) => issue.code === 'duplicate');
    expect(duplicate?.count).toBe(1);
  });
});
