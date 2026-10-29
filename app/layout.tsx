import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Office Assistant — Asisten Excel, Word, PowerPoint',
  description: 'Aplikasi web produktivitas kerja berbahasa Indonesia. Rumus Excel, kamus shortcut, pembersih data, dan kerangka dokumen. Gratis, tanpa login.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="bg-bg text-text">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
