# Office Assistant — Kamus, Asisten Rumus, Pembersih Data

Aplikasi web produktivitas kerja (non-komersial) untuk Excel, Word, dan PowerPoint. Bahasa: Indonesia. Dibangun berdasarkan dokumen BRD/PRD/Arsitektur/API/Deployment.

## Fitur tersedia
- **Beranda** — pilihan fitur utama.
- **Asisten Rumus (P1)** — input kebutuhan dalam bahasa Indonesia → rumus siap salin + penjelasan + contoh + catatan versi Excel.
- **Kamus Rumus & Shortcut (P2)** — pencarian instan, filter aplikasi dan jenis, offline setelah pemuatan pertama.
- **Pembersih Data (P3)** — tempel data Excel/CSV (maks. 2.000 baris), deteksi duplikat, spasi berlebih, kolom gabungan, tanggal campur, dan jumlah kolom tidak rata. Perbaikan berjalan di browser, pratinjau + unduh CSV. Saran AI opsional hanya mengirim 20 baris contoh.
- **Kerangka Dokumen (P4)** — surat resmi, laporan, notulen, proposal; unduh .docx.
- **Outline Presentasi (P5)** — topik + audiens + jumlah slide (5–20) → daftar slide dengan poin dan saran visual; unduh .pptx.
- **Template Gratis (P6)** — katalog 6 template (invoice, absensi, anggaran, jadwal, CV, slide dasar) dengan pratinjau, deskripsi, dan unduhan langsung .xlsx/.docx/.pptx.

## Tambahan
- **PWA**: `manifest` + service worker → bisa dipasang di HP dan jalan offline setelah kunjungan pertama.
- Mode fallback lokal: tanpa `ANTHROPIC_API_KEY`, semua fitur AI tetap menjawab dari aturan lokal.

## Teknologi
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- zod (validasi), Claude API (opsional, fallback lokal jika tanpa API key)
- Upstash Redis (opsional, rate limit in-memory jika tidak tersedia)
- Vitest (unit test + evaluasi prompt)

## Menjalankan secara lokal

```bash
cp .env.example .env   # isi ANTHROPIC_API_KEY dan Upstash jika ingin pakai AI asli
npm install
npm run dev
# Buka http://localhost:3000
```

Tanpa `ANTHROPIC_API_KEY` aplikasi tetap berjalan dalam **mode fallback lokal** (rumus, kamus, pembersihan data, kerangka dokumen, dan outline slide dari aturan lokal, tanpa panggilan AI).

## Tes

```bash
npm test
npm run lint
```

CI GitHub Actions (`.github/workflows/ci.yml`) menjalankan lint, test, dan build di setiap push ke `main`.

## Template

File template dibuat oleh `scripts/generate-templates.mjs` (SheetJS + docx + pptxgenjs). Regenerasi:

```bash
npm run templates
```

## Deploy (Vercel)

1. Dorong kode ke repositori Git.
2. Impor repositori di Vercel (framework: Next.js).
3. Isi variabel lingkungan (`ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
4. Buat database Upstash Redis (tier gratis).
5. Deploy, hubungkan domain (opsional).

## Struktur direktori

```
app/            # Halaman Next.js + route handler API
components/     # Komponen UI React
lib/            # Skema zod, klien Claude, rate limit, prompt, cleaner
data/           # Data kamus statis (JSON)
tests/          # Unit test + evaluasi prompt
```

## Lisensi

Non-komersial, tanpa iklan, tanpa jual data.
