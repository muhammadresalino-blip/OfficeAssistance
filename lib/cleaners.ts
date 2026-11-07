/**
 * Aturan pembersih data (P3) — seluruh proses berjalan di browser.
 * Tidak ada data yang dikirim ke server dari modul ini.
 */

export const MAX_ROWS = 2000;
export const MAX_SAMPLE_ROWS = 20;

export type IssueCode =
  | 'duplicate'
  | 'extra_space'
  | 'merged_column'
  | 'mixed_date'
  | 'uneven_columns';

export interface IssueInfo {
  code: IssueCode;
  label: string;
  description: string;
  manual: string;
  count: number;
}

export interface CleanOptions {
  trim: boolean;
  dedupe: boolean;
  normalizeDates: boolean;
  padColumns: boolean;
}

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  trim: true,
  dedupe: true,
  normalizeDates: false,
  padColumns: false,
};

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

function detectDelimiter(lines: string[]): string {
  const sample = lines.slice(0, 5).join('\n');
  const tabs = (sample.match(/\t/g) ?? []).length;
  const semicolons = (sample.match(/;/g) ?? []).length;
  const commas = (sample.match(/,/g) ?? []).length;

  if (tabs > 0 && tabs >= semicolons && tabs >= commas) return '\t';
  if (semicolons > commas) return ';';
  return ',';
}

/** Parse satu baris dengan dukungan tanda kutip ganda ("" = kutip literal). */
function parseLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' && current.length === 0) {
      inQuotes = true;
    } else if (char === delimiter) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

/**
 * Ubah teks tempelan (tab atau CSV) menjadi baris/kolom.
 * Baris kosong diabaikan dan jumlah baris dibatasi `limit`.
 */
export function parseText(text: string, limit: number = MAX_ROWS): string[][] {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines);
  return lines.slice(0, limit).map((line) => parseLine(line, delimiter));
}

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Ubah baris/kolom menjadi teks CSV (CRLF, aman untuk Excel). */
export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}

/** Ambil maksimal `max` baris contoh untuk saran AI (default 20). */
export function takeSample(rows: string[][], max: number = MAX_SAMPLE_ROWS): string[][] {
  return rows.slice(0, max);
}

/* -------------------------------------------------------------------------- */
/* Perbaikan lokal                                                            */
/* -------------------------------------------------------------------------- */

export const trimAll = (rows: string[][]): string[][] =>
  rows.map((row) => row.map((cell) => cell.replace(/\s+/g, ' ').trim()));

export function removeDuplicates(rows: string[][]): string[][] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = row.join('|').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DMY_DATE = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/;

function isIsoDate(value: string): boolean {
  const match = value.trim().match(ISO_DATE);
  if (!match) return false;
  const month = Number(match[2]);
  const day = Number(match[3]);
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function isDmyDate(value: string): boolean {
  const match = value.trim().match(DMY_DATE);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}

function dmyToIso(value: string): string {
  const match = value.trim().match(DMY_DATE);
  if (!match) return value;
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  let year = match[3];
  if (year.length === 2) year = `20${year}`;
  return `${year}-${month}-${day}`;
}

/**
 * Seragamkan tanggal gaya Indonesia (dd/mm/yy) menjadi ISO (yyyy-mm-dd).
 * Tanggal ISO yang sudah benar dibiarkan apa adanya.
 */
export function normalizeDates(rows: string[][]): string[][] {
  return rows.map((row) => row.map((cell) => (isDmyDate(cell) ? dmyToIso(cell) : cell)));
}

function mostCommonColumnCount(rows: string[][]): number {
  const counts = new Map<number, number>();
  for (const row of rows) {
    counts.set(row.length, (counts.get(row.length) ?? 0) + 1);
  }

  let bestLength = 0;
  let bestCount = -1;
  counts.forEach((count, length) => {
    if (count > bestCount) {
      bestCount = count;
      bestLength = length;
    }
  });
  return bestLength;
}

/** Samakan jumlah kolom dengan menambahkan sel kosong hingga kolom terbanyak. */
export function padColumns(rows: string[][]): string[][] {
  const target = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return rows.map((row) =>
    row.length === target ? row : [...row, ...Array.from({ length: target - row.length }, () => '')]
  );
}

/** Terapkan perbaikan terpilih secara berurutan di sisi klien. */
export function cleanRows(
  rows: string[][],
  options: Partial<CleanOptions> = {}
): { rows: string[][]; removed: number } {
  const opts: CleanOptions = { ...DEFAULT_CLEAN_OPTIONS, ...options };
  let result = opts.trim ? trimAll(rows) : rows;
  if (opts.normalizeDates) result = normalizeDates(result);
  if (opts.padColumns) result = padColumns(result);
  if (opts.dedupe) result = removeDuplicates(result);

  return { rows: result, removed: Math.max(0, rows.length - result.length) };
}

/* -------------------------------------------------------------------------- */
/* Deteksi masalah                                                            */
/* -------------------------------------------------------------------------- */

function countDuplicateRows(rows: string[][]): number {
  const seen = new Set<string>();
  let duplicates = 0;
  for (const row of rows) {
    const key = row.join('|').toLowerCase();
    if (seen.has(key)) duplicates += 1;
    else seen.add(key);
  }
  return duplicates;
}

function hasExtraSpace(cell: string): boolean {
  return cell !== cell.trim() || /\s{2,}/.test(cell);
}

function countExtraSpaceRows(rows: string[][]): number {
  return rows.filter((row) => row.some(hasExtraSpace)).length;
}

/**
 * Heuristik kolom gabungan: satu kolom berisi dua nilai teks yang dipisah koma
 * (mis. "Budi, Jakarta") pada sebagian besar baris.
 */
function mergedColumnStats(rows: string[][]): { column: number; count: number } | null {
  if (rows.length < 3) return null;

  const header = rows[0] ?? [];
  const width = mostCommonColumnCount(rows);
  if (width < 1) return null;

  let best: { column: number; count: number } | null = null;

  for (let column = 0; column < width; column += 1) {
    const headerCell = (header[column] ?? '').toLowerCase();
    // Kolom alamat memang wajar memakai koma; jangan dianggap gabungan.
    if (/alamat|address|jalan|lokasi/.test(headerCell)) continue;

    let matches = 0;
    let filled = 0;

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
      const value = (rows[rowIndex]?.[column] ?? '').trim();
      if (value === '') continue;
      filled += 1;
      if (/^[^,;]+,/.test(value) && /[a-zA-Z]/.test(value) && !isIsoDate(value) && !isDmyDate(value)) {
        matches += 1;
      }
    }

    if (filled >= 2 && matches / filled >= 0.6) {
      if (!best || matches > best.count) best = { column, count: matches };
    }
  }

  return best;
}

function countDateCells(rows: string[][]): { dmy: number; iso: number } {
  let dmy = 0;
  let iso = 0;
  for (const row of rows) {
    for (const cell of row) {
      if (isIsoDate(cell)) iso += 1;
      else if (isDmyDate(cell)) dmy += 1;
    }
  }
  return { dmy, iso };
}

function countUnevenRows(rows: string[][]): number {
  const common = mostCommonColumnCount(rows);
  return rows.filter((row) => row.length !== common).length;
}

const ISSUE_META: Record<IssueCode, Omit<IssueInfo, 'code' | 'count'>> = {
  duplicate: {
    label: 'Baris duplikat',
    description: 'Ada baris yang isinya sama (tidak peka huruf besar/kecil).',
    manual: 'Pilih data → Data → Remove Duplicates, lalu centang kolom kunci.',
  },
  extra_space: {
    label: 'Spasi berlebih',
    description: 'Sel memiliki spasi di awal/akhir atau spasi ganda.',
    manual: 'Gunakan Data → Text to Columns, atau rumus =TRIM(A2) pada kolom bantu.',
  },
  merged_column: {
    label: 'Kolom gabungan',
    description: 'Dua nilai teks tergabung dalam satu sel dengan pemisah koma.',
    manual: 'Pilih kolom → Data → Text to Columns → Delimited → Comma.',
  },
  mixed_date: {
    label: 'Format tanggal campur',
    description: 'Terdapat tanggal dd/mm/yy dan yyyy-mm-dd dalam satu tabel.',
    manual: 'Seragamkan lewat Format Cells → Date, atau =DATEVALUE(A2) lalu format ulang.',
  },
  uneven_columns: {
    label: 'Jumlah kolom tidak rata',
    description: 'Sebagian baris punya jumlah kolom berbeda dari mayoritas.',
    manual: 'Pastikan setiap baris memiliki jumlah kolom sama sebelum diolah.',
  },
};

/** Daftar masalah beserta jumlah kemunculannya, untuk ditampilkan di UI. */
export function analyzeIssues(rows: string[][]): IssueInfo[] {
  if (rows.length === 0) return [];

  const issues: IssueInfo[] = [];
  const add = (code: IssueCode, count: number) => {
    if (count > 0) issues.push({ code, ...ISSUE_META[code], count });
  };

  add('duplicate', countDuplicateRows(rows));
  add('extra_space', countExtraSpaceRows(rows));

  const merged = mergedColumnStats(rows);
  if (merged) add('merged_column', merged.count);

  const dates = countDateCells(rows);
  if (dates.dmy > 0 && dates.iso > 0) add('mixed_date', dates.dmy + dates.iso);

  add('uneven_columns', countUnevenRows(rows));

  return issues;
}

export function detectIssues(rows: string[][]): IssueCode[] {
  return analyzeIssues(rows).map((issue) => issue.code);
}
