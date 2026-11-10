import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text">Office Assistant</h1>
        <p className="mt-2 text-textSecondary">
          Aplikasi web produktivitas kerja untuk Excel, Word, dan PowerPoint — dalam Bahasa Indonesia.
          Gratis, tanpa login, tanpa iklan.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Link href="/rumus" className="block card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-button bg-excel text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              X
            </span>
            <h2 className="text-xl font-bold text-text">Asisten Rumus Excel</h2>
          </div>
          <p className="text-textSecondary text-sm">Tulis kebutuhan dalam bahasa Indonesia, dapatkan rumus siap salin beserta penjelasan dan contoh.</p>
          <span className="mt-4 inline-block text-primary font-semibold hover:underline">Coba sekarang →</span>
        </Link>

        <Link href="/bersihkan" className="block card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-button bg-primary text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              ✨
            </span>
            <h2 className="text-xl font-bold text-text">Pembersih Data</h2>
          </div>
          <p className="text-textSecondary text-sm">Deteksi duplikat, spasi berlebih, dan format tanggal otomatis. Bersihkan data Excel langsung di browser.</p>
          <span className="mt-4 inline-block text-primary font-semibold hover:underline">Mulai bersihkan →</span>
        </Link>

        <Link href="/dokumen" className="block card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-button bg-word text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              W
            </span>
            <h2 className="text-xl font-bold text-text">Kerangka Dokumen</h2>
          </div>
          <p className="text-textSecondary text-sm">Buat draf surat resmi, laporan, dan notulen rapat dengan struktur standar Indonesia.</p>
          <span className="mt-4 inline-block text-primary font-semibold hover:underline">Buat dokumen →</span>
        </Link>

        <Link href="/presentasi" className="block card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-button bg-powerpoint text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              P
            </span>
            <h2 className="text-xl font-bold text-text">Outline Presentasi</h2>
          </div>
          <p className="text-textSecondary text-sm">Ubah topik menjadi outline slide yang terstruktur dan menarik untuk audiens Anda.</p>
          <span className="mt-4 inline-block text-primary font-semibold hover:underline">Buat outline →</span>
        </Link>

        <Link href="/kamus" className="block card hover:shadow-md transition-shadow group lg:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-button bg-gray-200 text-text flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              📖
            </span>
            <h2 className="text-xl font-bold text-text">Kamus Rumus &amp; Shortcut</h2>
          </div>
          <p className="text-textSecondary text-sm">Cari instan rumus dan shortcut Excel, Word, PowerPoint. Bekerja offline setelah pemuatan pertama.</p>
          <span className="mt-4 inline-block text-primary font-semibold hover:underline">Buka kamus →</span>
        </Link>
      </section>

      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Template Gratis', to: '#', status: 'Rilis 4' },
          { label: 'Mode Gelap', to: '#', status: 'Segera' },
          { label: 'Add-in Excel', to: '#', status: 'Rencana' },
          { label: 'Dukungan PDF', to: '#', status: 'Rencana' },
        ].map((item) => (
          <a key={item.label} href={item.to} className="card flex flex-col gap-2 text-sm hover:shadow-md transition-shadow">
            <span className="flex items-center gap-1 text-textSecondary font-medium">
              {item.label}
            </span>
            <span className="text-xs text-textSecondary uppercase tracking-wider">{item.status}</span>
          </a>
        ))}
      </section>

      <footer className="mt-16 pt-8 border-t border-border text-center text-xs text-textSecondary">
        Office Assistant v1.0 &bull; Non-komersial &bull; Tanpa iklan &bull; Tanpa jual data
      </footer>
    </main>
  );
}
