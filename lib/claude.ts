import Anthropic from '@anthropic-ai/sdk';
import type { FormulaResponse } from './schemas';

const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);
const client = hasApiKey ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

/**
 * Kirim permintaan ke Claude dan terima JSON.
 * Jika ANTHROPIC_API_KEY tidak tersedia (mode fallback lokal),
 * kembalikan respons deterministik berdasarkan aturan sederhana.
 */
export async function askJson(
  system: string,
  user: string,
  model = 'claude-haiku-3-5-20241022',
  fallback: (user: string) => Record<string, unknown> = fallbackFromUser
): Promise<Record<string, unknown>> {
  if (!client) {
    return fallback(user);
  }

  const msg = await client.messages.create({
    model,
    max_tokens: 1000,
    system: system + ' Jawab hanya dengan JSON valid tanpa teks lain.',
    messages: [{ role: 'user', content: user }],
  });

  const text = msg.content
    .map((b) => (b.type === 'text' ? b.text : ''))
    .join('')
    .replace(/```json|```/g, '')
    .trim();

  return JSON.parse(text);
}

/**
 * Fallback lokal untuk rumus Excel sederhana (mode tanpa API key).
 * Meniru bentuk respons yang diharapkan agar UI tetap bisa diuji.
 */
function fallbackFromUser(user: string): Record<string, unknown> {
  const lower = user.toLowerCase();
  const separator = lower.includes('pemisah: koma') ? ',' : ';';
  const range = extractRange(user) ?? 'A2:C100';

  let formula: string;
  let explanation: string[];
  let example: { input: string; output: string };
  let minVersion = 'Excel 2007';

  if (/(jumlah|total|penjumlahan|sum)/.test(lower)) {
    const col = extractColumn(range) ?? 'C';
    const condCol = extractConditionColumn(lower) ?? 'A';
    const condVal = extractConditionValue(lower) ?? 'Jakarta';
    formula = `=SUMIFS(${col}2:${col}100;${condCol}2:${condCol}100;"${condVal}")`;
    if (separator === ',') {
      formula = formula.replace(/;/g, ',');
    }
    explanation = [
      `${col}2:${col}100 adalah kolom yang dijumlahkan`,
      `${condCol}2:${condCol}100 diperiksa sama dengan ${condVal}`,
      'Catatan: ini hasil fallback lokal, periksa kembali sebelum digunakan',
    ];
    example = { input: `${condVal}, 500`, output: '500' };
  } else if (/(rata-rata|average)/.test(lower)) {
    const col = extractColumn(range) ?? 'C';
    formula = `=AVERAGE(${col}2:${col}100)`;
    if (separator === ',') {
      formula = formula.replace(/;/g, ',');
    }
    explanation = [`${col}2:${col}100 adalah kolom yang dirata-ratakan`, 'Catatan: ini hasil fallback lokal, periksa kembali sebelum digunakan'];
    example = { input: '10, 20, 30', output: '20' };
  } else if (/(maksimum|tertinggi|max)/.test(lower)) {
    const col = extractColumn(range) ?? 'C';
    formula = `=MAX(${col}2:${col}100)`;
    if (separator === ',') {
      formula = formula.replace(/;/g, ',');
    }
    explanation = [`${col}2:${col}100 adalah kolom yang dicari nilainya tertinggi`, 'Catatan: ini hasil fallback lokal, periksa kembali sebelum digunakan'];
    example = { input: '10, 25, 7', output: '25' };
  } else if (/(minimum|terendah|min)/.test(lower)) {
    const col = extractColumn(range) ?? 'C';
    formula = `=MIN(${col}2:${col}100)`;
    if (separator === ',') {
      formula = formula.replace(/;/g, ',');
    }
    explanation = [`${col}2:${col}100 adalah kolom yang dicari nilainya terendah`, 'Catatan: ini hasil fallback lokal, periksa kembali sebelum digunakan'];
    example = { input: '10, 25, 7', output: '7' };
  } else if (/(jika|if|kondisi)/.test(lower)) {
    formula = `=IF(A2="Jakarta";"Ya";"Tidak")`;
    if (separator === ',') {
      formula = formula.replace(/;/g, ',');
    }
    explanation = ['Jika A2 sama dengan Jakarta maka tampilkan Ya, jika tidak tampilkan Tidak', 'Catatan: ini hasil fallback lokal, periksa kembali sebelum digunakan'];
    example = { input: 'Jakarta', output: 'Ya' };
  } else {
    const col = extractColumn(range) ?? 'A';
    formula = `=SUM(${col}2:${col}100)`;
    if (separator === ',') {
      formula = formula.replace(/;/g, ',');
    }
    explanation = ['Rentang data dijumlahkan secara keseluruhan', 'Catatan: ini hasil fallback lokal, periksa kembali sebelum digunakan'];
    example = { input: '5, 10, 15', output: '30' };
  }

  return {
    formula,
    explanation,
    example,
    minVersion,
    clarification: undefined,
  } as unknown as Record<string, unknown>;
}

function extractRange(text: string): string | null {
  const m = text.match(/\b([A-Z]+[0-9]+):([A-Z]+[0-9]+)\b/i);
  return m ? `${m[1].toUpperCase()}:${m[2].toUpperCase()}` : null;
}

function extractColumn(range: string): string | null {
  const m = range.match(/([A-Z]+)\d/);
  return m ? m[1].toUpperCase() : null;
}

function extractConditionColumn(text: string): string | null {
  const m = text.match(/\b([A-Z]+)2:/i);
  return m ? m[1].toUpperCase() : null;
}

function extractConditionValue(text: string): string | null {
  const m = text.match(/("([^"]+)"|’([^’]+)’)/);
  return m ? (m[2] ?? m[3]) : null;
}

export { hasApiKey };
