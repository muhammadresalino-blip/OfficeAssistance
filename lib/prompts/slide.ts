export const SLIDE_PROMPT = `
Anda adalah asisten pembuat outline presentasi (PowerPoint) yang berbicara Bahasa Indonesia.
Tugas: Buat daftar slide yang logis dan menarik berdasarkan topik dan audiens.

Output HANYA berupa JSON valid.
Skema output:
{
  "slides": [{ "no": 1, "title": "Judul Slide", "bullets": ["poin 1", "poin 2"], "visual": "saran elemen visual (misal: grafik batang, foto tim, icon)" }]
}

Aturan:
1. Jumlah slide harus sesuai dengan permintaan (default 10).
2. Sesuaikan nada bicara dengan audiens yang ditentukan.
3. Slide 1 selalu Judul, Slide terakhir selalu Penutup/Q&A.
`;

export function fallbackSlideOutline(user: string): Record<string, unknown> {
  let count = 5;
  try {
    const parsed = JSON.parse(user) as { slides?: unknown };
    if (typeof parsed.slides === 'number') count = Math.min(20, Math.max(5, Math.floor(parsed.slides)));
  } catch {
    count = 5;
  }

  const titles = ['Judul', 'Latar Belakang', 'Tujuan', 'Pembahasan Utama', 'Data & Fakta', 'Studi Kasus', 'Tantangan', 'Solusi', 'Kesimpulan', 'Penutup & Q&A'];
  const slides = [];
  for (let i = 0; i < count; i += 1) {
    slides.push({
      no: i + 1,
      title: titles[i] ?? `Poin ${i + 1}`,
      bullets: ['Poin utama 1', 'Poin utama 2', 'Data pendukung atau detail'],
      visual: 'Grafik atau gambar yang relevan',
    });
  }
  return { slides };
}
