export const DOC_PROMPT = `
Anda adalah asisten pembuat kerangka dokumen profesional yang berbicara Bahasa Indonesia.
Tugas: Buat kerangka dokumen yang terstruktur berdasarkan jenis dan judul yang diminta.

Output HANYA berupa JSON valid.
Skema output:
{
  "sections": [{ "heading": "Judul Bagian", "content": "Penjelasan detail atau poin-poin apa yang harus diisi di bagian ini, gunakan [kurung kotak] untuk placeholder instruksional." }],
  "tips": ["tips penulisan spesifik untuk jenis dokumen ini"]
}

Aturan:
1. Untuk surat_resmi, sertakan elemen standar: Kop, Nomor, Lampiran, Perihal, Salam Pembuka, Isi, Penutup.
2. Isi 'content' harus informatif dan membantu pengguna menulis, bukan hanya placeholder kosong.
3. Seluruh teks dalam Bahasa Indonesia formal.
`;

export function fallbackDocOutline(user: string): Record<string, unknown> {
  const lower = user.toLowerCase();
  if (lower.includes('surat_resmi')) {
    return {
      sections: [
        { heading: 'Kepala Surat (Kop)', content: '[Nama Instansi/Perusahaan]\n[Alamat Lengkap]\n[Nomor Telepon/Email]' },
        { heading: 'Pembukaan', content: 'Nomor: [Nomor Surat]\nPerihal: [Tujuan Surat]\n\nKepada Yth,\n[Nama Penerima]\ndi Tempat' },
        { heading: 'Isi Surat', content: 'Menindaklanjuti [alasan surat], kami bermaksud untuk [tujuan utama]. Kegiatan ini akan dilaksanakan pada:\nHari/Tgl: [Hari, Tanggal]\nWaktu: [Jam]\nTempat: [Lokasi]' },
        { heading: 'Penutup', content: 'Demikian informasi ini kami sampaikan. Atas perhatiannya kami ucapkan terima kasih.' }
      ],
      tips: ['Gunakan bahasa formal dan lugas.', 'Pastikan nomor surat sesuai dengan urutan pengarsipan.']
    };
  }
  return {
    sections: [
      { heading: 'Pendahuluan', content: 'Latar belakang dan tujuan dari [judul].' },
      { heading: 'Pembahasan', content: 'Detail poin utama yang ingin disampaikan.' },
      { heading: 'Kesimpulan', content: 'Ringkasan dan tindak lanjut yang diharapkan.' }
    ],
    tips: ['Gunakan poin-poin agar mudah dibaca.']
  };
}
