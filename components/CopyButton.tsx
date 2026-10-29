'use client';

import { useState, useCallback } from 'react';

export interface CopyButtonProps {
  text: string;
  label?: string;
  size?: 'small' | 'medium';
  className?: string;
}

export default function CopyButton({ text, label = 'Salin', size = 'medium', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error('Gagal menyalin:', err);
    }
  }, [text]);

  const btnClasses = `inline-flex items-center gap-1.5 rounded-button border border-inputBorder bg-card px-2 py-1 ${size === 'small' ? 'text-xs px-1.5' : 'text-sm'} transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary touch-target ${className ?? ''}`;

  return (
    <button type="button" onClick={handleCopy} className={btnClasses} title={label} aria-label={label}>
      {copied ? 'Tersalin' : label}
      {copied && ' ✓'}
    </button>
  );
}
