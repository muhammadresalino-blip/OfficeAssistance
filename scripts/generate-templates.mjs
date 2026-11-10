/**
 * Generate file template statis ke public/templates/.
 * Jalankan: node scripts/generate-templates.mjs
 * Hasil generate di-commit; script hanya perlu dijalankan ulang jika konten berubah.
 */
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import fs from 'node:fs';

// Build ESM SheetJS tidak otomatis mengikat modul fs; injeksikan agar bisa baca/tulis file.
XLSX.set_fs(fs);
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import pptxgen from 'pptxgenjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'templates');
await mkdir(outDir, { recursive: true });

/* ------------------------------- helpers -------------------------------- */

function sheetFromRows(rows, widths) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  if (widths) ws['!cols'] = widths.map((wch) => ({ wch }));
  return ws;
}

function writeXlsx(fileName, sheetName, rows, widths) {
  writeXlsxWithSheet(fileName, sheetName, sheetFromRows(rows, widths));
}

const h = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 200 } });
const p = (text, opts = {}) => new Paragraph({ children: [new TextRun(text)], spacing: { after: 80 }, ...opts });

/* -------------------------------- invoice ------------------------------- */

const invoiceRows = [
  ['INVOICE'],
  ['No. Invoice', 'INV-001'],
  ['Tanggal', '[YYYY-MM-DD]'],
  ['Pelanggan', '[Nama Pelanggan]'],
  [],
  ['No', 'Deskripsi', 'Qty', 'Harga Satuan', 'Total'],
  [1, '[Deskripsi pekerjaan]', 1, 0, 0],
  [2, '[Deskripsi pekerjaan]', 1, 0, 0],
  [3, '[Deskripsi pekerjaan]', 1, 0, 0],
  ['', '', '', 'TOTAL', 0],
  ['', '', '', 'PPN 11%', 0],
  ['', '', '', 'GRAND TOTAL', 0],
];
const invoiceWs = sheetFromRows(invoiceRows, [5, 30, 6, 16, 16]);
invoiceWs['E7'] = { t: 'n', f: 'C7*D7' };
invoiceWs['E8'] = { t: 'n', f: 'C8*D8' };
invoiceWs['E9'] = { t: 'n', f: 'C9*D9' };
invoiceWs['E10'] = { t: 'n', f: 'SUM(E7:E9)' };
invoiceWs['E11'] = { t: 'n', f: 'E10*0.11' };
invoiceWs['E12'] = { t: 'n', f: 'E10+E11' };
writeXlsxWithSheet('invoice.xlsx', 'Invoice', invoiceWs);

/* -------------------------------- absensi ------------------------------- */

writeXlsx(
  'absensi.xlsx',
  'Absensi',
  [
    ['ABSENSI BULANAN'],
    ['Nama', '[Nama Karyawan]', 'Jabatan', '[Jabatan]'],
    [],
    ['No', 'Nama', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Keterangan', 'Status'],
    [1, '[Nama]', '[YYYY-MM-DD]', '[08:00]', '[17:00]', '', 'Hadir'],
    [2, '[Nama]', '[YYYY-MM-DD]', '[08:00]', '[17:00]', '', 'Hadir'],
    [3, '[Nama]', '[YYYY-MM-DD]', '[08:00]', '[17:00]', '', 'Hadir'],
    [4, '[Nama]', '[YYYY-MM-DD]', '[08:00]', '[17:00]', '', 'Izin'],
    [5, '[Nama]', '[YYYY-MM-DD]', '[08:00]', '[17:00]', '', 'Sakit'],
  ],
  [5, 22, 13, 11, 12, 20, 10]
);

/* ------------------------------- anggaran ------------------------------- */

const anggaranRows = [
  ['RENCANA ANGGARAN'],
  ['Periode', '[Bulan/Tahun]'],
  [],
  ['No', 'Kategori', 'Rencana (Rp)', 'Realisasi (Rp)', 'Selisih (Rp)', 'Keterangan'],
  [1, '[Kategori]', 0, 0, 0, ''],
  [2, '[Kategori]', 0, 0, 0, ''],
  [3, '[Kategori]', 0, 0, 0, ''],
  [4, '[Kategori]', 0, 0, 0, ''],
  ['', '', '', '', 'TOTAL', 0],
];
const anggaranWs = sheetFromRows(anggaranRows, [5, 24, 16, 16, 16, 24]);
for (let row = 5; row <= 8; row += 1) anggaranWs[`E${row}`] = { t: 'n', f: `C${row}-D${row}` };
anggaranWs['F9'] = { t: 'n', f: 'SUM(E5:E8)' };
writeXlsxWithSheet('anggaran.xlsx', 'Anggaran', anggaranWs);

/* -------------------------------- jadwal ------------------------------- */

const timeSlots = ['08:00-09:40', '09:50-11:30', '11:30-13:00', '13:00-14:40', '14:50-16:30'];
writeXlsx(
  'jadwal.xlsx',
  'Jadwal',
  [
    ['JADWAL KEGIATAN MINGGUAN'],
    [],
    ['Jam', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    ...timeSlots.map((slot) => [slot, '[Kegiatan]', '[Kegiatan]', '[Kegiatan]', '[Kegiatan]', '[Kegiatan]']),
  ],
  [14, 18, 18, 18, 18, 18]
);

/* ---------------------------------- CV --------------------------------- */

const cvDoc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          text: '[NAMA LENGKAP]',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun('[Alamat] | [No. HP] | [Email]')],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        h('Pendidikan'),
        p('[Gelar / Jurusan] — [Nama Institusi], [Tahun Masuk]–[Tahun Lulus]'),
        h('Pengalaman Kerja'),
        p('[Jabatan] — [Nama Perusahaan], [Tahun]–[Tahun]'),
        new Paragraph({
          children: [new TextRun({ text: '[Tanggung jawab dan pencapaian utama]', italics: true })],
          bullet: { level: 0 },
        }),
        h('Keahlian'),
        new Paragraph({ children: [new TextRun('[Keahlian 1]')], bullet: { level: 0 } }),
        new Paragraph({ children: [new TextRun('[Keahlian 2]')], bullet: { level: 0 } }),
        h('Referensi'),
        p('[Nama Referensi] — [Jabatan], [No. HP]'),
      ],
    },
  ],
});
await writeFile(path.join(outDir, 'cv.docx'), await Packer.toBuffer(cvDoc));

/* ------------------------------ slide dasar ------------------------------ */

const pptx = new pptxgen();
const deck = [
  { title: '[Judul Presentasi]', body: '[Nama Pembuat]\n[Instansi / Perusahaan]' },
  { title: 'Agenda', body: '1. Latar Belakang\n2. Pembahasan\n3. Kesimpulan' },
  { title: 'Latar Belakang', body: '[Masalah atau konteks yang ingin disampaikan]' },
  { title: 'Pembahasan', body: '[Poin utama 1]\n[Poin utama 2]\n[Poin utama 3]' },
  { title: 'Data & Bukti', body: '[Angka, grafik, atau temuan pendukung]' },
  { title: 'Kesimpulan', body: '[Ringkasan temuan dan rekomendasi]' },
  { title: 'Penutup', body: 'Terima kasih\n[Q&A]' },
];
for (const slide of deck) {
  const s = pptx.addSlide();
  s.addText(slide.title, { x: 0.5, y: 1.8, w: '90%', fontSize: 36, bold: true, align: 'center', color: '1D6F42' });
  s.addText(slide.body, { x: 1, y: 3.2, w: '80%', fontSize: 18, align: 'center', color: '666666' });
}
await pptx.writeFile({ fileName: path.join(outDir, 'slide-dasar.pptx') });

/* ------------------------------- verifikasi ------------------------------ */

const files = ['invoice.xlsx', 'absensi.xlsx', 'anggaran.xlsx', 'jadwal.xlsx', 'cv.docx', 'slide-dasar.pptx'];
for (const file of files) {
  const { size } = await stat(path.join(outDir, file));
  if (size < 1000) throw new Error(`${file} terlalu kecil (${size} byte)`);
}

// Baca ulang xlsx dengan parser berbeda untuk memastikan file valid.
for (const file of ['invoice.xlsx', 'absensi.xlsx', 'anggaran.xlsx', 'jadwal.xlsx']) {
  const wb = XLSX.readFile(path.join(outDir, file));
  if (wb.SheetNames.length !== 1) throw new Error(`${file} tidak punya sheet`);
}

console.log(`OK: ${files.length} template di ${outDir}`);

// helper di bawah: penulisan xlsx dari worksheet jadi (buffer, hindari writeFile SheetJS)
function writeXlsxWithSheet(fileName, sheetName, ws) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  writeFileSync(path.join(outDir, fileName), buffer);
}
