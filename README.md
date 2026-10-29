# Office Assistant — MVP (Kamus + Asisten Rumus)

Aplikasi web produktivitas kerja (non-komersial) untuk Excel, Word, dan PowerPoint. Bahasa: Indonesia. Dibangun berdasarkan dokumen BRD/PRD/Arsitektur/API/Deployment.

## Fitur MVP
- **Beranda** — pilihan fitur utama + pencarian global.
- **Asisten Rumus (P1)** — input kebutuhan dalam bahasa Indonesia → rumus siap salin + penjelasan + contoh + catatan versi Excel.
- **Kamus Rumus & Shortcut (P2)** — pencarian instan, filter aplikasi dan jenis, offline setelah pemuatan pertama.

## Teknologi
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- zod (validasi), Claude API (opsional, fallback lokal jika tanpa API key)
- Upstash Redis (opsional, rate limit in-memory jika tidak tersedia)
- Vitest (unit test + evaluasi prompt)

## Menjalankan secara lokal

```bash
cd office-assistant
cp .env.example .env   # isi ANTHROPIC_API_KEY dan Upstash jika ingin pakai AI asli
npm install
npm run dev
# Buka http://localhost:3000
```

Tanpa `ANTHROPIC_API_KEY` aplikasi tetap berjalan dalam **mode fallback** (rumus dan kamus dari data lokal, tanpa panggilan AI).

## Tes

```bash
npm test
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
