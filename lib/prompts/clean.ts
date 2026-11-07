export const CLEAN_PROMPT = `
Anda adalah asisten pembersihan data spreadsheet yang berbicara Bahasa Indonesia.

Tugas: Berdasarkan 20 baris contoh dan daftar masalah yang diberikan, berikan langkah perbaikan manual di Excel
serta rumus alternatif yang relevan.

Output HANYA berupa JSON valid, tanpa penjelasan di luar JSON, tanpa markdown code block.

Skema output JSON:
{
  "steps": ["langkah manual singkat dan berurutan dalam Bahasa Indonesia"],
  "formulas": [{ "purpose": "tujuan rumus", "formula": "rumus Excel lengkap dimulai dengan =" }]
}

Aturan:
1. Maksimal 6 langkah dan 4 rumus. Jangan mengulang langkah yang sama.
2. Gunakan pemisah argumen titik koma (;).
3. Jangan mengarang nama kolom yang tidak terlihat pada contoh data.
4. Jangan menyertakan data pribadi dari contoh ke dalam penjelasan; cukup sebut nama kolom.
5. Jika tidak ada masalah, isi steps dengan satu kalimat bahwa data sudah cukup bersih.
6. Seluruh teks output dalam Bahasa Indonesia.
`;

export function fallbackCleanSuggest(user: string): Record<string, unknown> {
  let issues: string[] = [];
  try {
    const parsed = JSON.parse(user) as { issues?: unknown };
    if (Array.isArray(parsed.issues)) {
      issues = parsed.issues.filter((issue): issue is string => typeof issue === 'string');
    }
  } catch {
    issues = [];
  }

  const steps: string[] = [];
  const formulas: { purpose: string; formula: string }[] = [];

  if (issues.includes('extra_space')) {
    steps.push('Rapikan spasi: pilih seluruh data, lalu gunakan Data → Text to Columns atau kolom bantu dengan =TRIM(A2).');
    formulas.push({ purpose: 'Rapikan spasi di sel A2', formula: '=TRIM(A2)' });
  }

  if (issues.includes('duplicate')) {
    steps.push('Hapus duplikat: pilih data → Data → Remove Duplicates, lalu centang kolom kunci.');
    formulas.push({ purpose: 'Tandai baris duplikat pada kolom A', formula: '=COUNTIF($A$2:$A$100;A2)>1' });
  }

  if (issues.includes('mixed_date')) {
    steps.push('Seragamkan tanggal: ubah semua tanggal ke format YYYY-MM-DD melalui Format Cells → Date.');
    formulas.push({ purpose: 'Ubah teks tanggal di A2 menjadi nilai tanggal', formula: '=DATEVALUE(A2)' });
  }

  if (issues.includes('merged_column')) {
    steps.push('Pisahkan kolom gabungan: pilih kolom → Data → Text to Columns → Delimited → Comma.');
    formulas.push({ purpose: 'Ambil bagian sebelum koma di sel A2', formula: '=TEXTBEFORE(A2;",")' });
  }

  if (issues.includes('uneven_columns')) {
    steps.push('Samakan jumlah kolom: tambahkan sel kosong pada baris yang kurang agar strukturnya rata.');
  }

  if (steps.length === 0) {
    steps.push('Data sudah cukup bersih. Periksa kembali tipe data tiap kolom sebelum diolah lebih lanjut.');
  }

  return { steps, formulas };
}
