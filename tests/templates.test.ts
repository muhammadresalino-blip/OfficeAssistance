import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';
import fs from 'node:fs';
import templates from '@/data/templates.json';

XLSX.set_fs(fs);

const rootDir = path.resolve(__dirname, '..');

describe('katalog template', () => {
  it('memiliki 6 template dengan id unik', () => {
    expect(templates).toHaveLength(6);
    const ids = templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('format valid dan konsisten dengan nama file', () => {
    for (const t of templates) {
      expect(['xlsx', 'docx', 'pptx']).toContain(t.format);
      expect(t.file).toBe(`${t.id}.${t.format}`);
      expect(t.downloadUrl).toBe(`/api/templates/${t.id}/download`);
    }
  });

  it('semua file benar-benar ada di public/templates', () => {
    for (const t of templates) {
      const filePath = path.join(rootDir, 'public', 'templates', t.file);
      expect(existsSync(filePath), `${t.file} tidak ada`).toBe(true);
    }
  });

  it('file xlsx terbaca kembali sebagai workbook valid', () => {
    const xlsxTemplates = templates.filter((t) => t.format === 'xlsx');
    expect(xlsxTemplates.length).toBeGreaterThanOrEqual(4);

    for (const t of xlsxTemplates) {
      const wb = XLSX.readFile(path.join(rootDir, 'public', 'templates', t.file));
      expect(wb.SheetNames.length).toBe(1);
      const firstCell = wb.Sheets[wb.SheetNames[0]]['A1'];
      expect(firstCell?.v, `${t.file} sheet kosong`).toBeTruthy();
    }
  });

  it('file xlsx punya formula (bukan sekadar teks)', () => {
    const wb = XLSX.readFile(path.join(rootDir, 'public', 'templates', 'invoice.xlsx'));
    const ws = wb.Sheets.Invoice;
    expect(ws['E10']?.f).toContain('SUM');
  });
});
