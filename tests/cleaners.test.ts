import { describe, it, expect } from 'vitest';
import { trimAll, removeDuplicates, detectIssues } from '@/lib/cleaners';

describe('cleaners', () => {
  describe('trimAll', () => {
    it('menghapus spasi berlebih dan trim tiap sel', () => {
      const rows = [
        ['  Budi   Santoso ', ' Jakarta  '],
        ['  Sari ', 'Bandung'],
      ];
      expect(trimAll(rows)).toEqual([['Budi Santoso', 'Jakarta'], ['Sari', 'Bandung']]);
    });
  });

  describe('removeDuplicates', () => {
    it('menghapus baris duplikat case-insensitive', () => {
      const rows = [
        ['Budi', 'Jakarta'],
        ['budi', 'jakarta'],
        ['Sari', 'Bandung'],
      ];
      expect(removeDuplicates(rows)).toEqual([['Budi', 'Jakarta'], ['Sari', 'Bandung']]);
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
      const rows = [['Budi  ', 'Jakarta']];
      expect(detectIssues(rows)).toContain('extra_space');
    });

    it('mendeteksi format tanggal campur', () => {
      const rows = [['12/01/24', '2024-01-12']];
      expect(detectIssues(rows)).toContain('mixed_date');
    });

    it('mengembalikan array kosong jika tidak ada masalah', () => {
      const rows = [['Budi', 'Jakarta'], ['Sari', 'Bandung']];
      expect(detectIssues(rows)).toEqual([]);
    });
  });
});
