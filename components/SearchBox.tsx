'use client';

import { useState, useCallback } from 'react';

export interface SearchBoxProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  label?: string;
}

export default function SearchBox({ placeholder = 'Cari...', value, onChange, onClear, label }: SearchBoxProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
    onClear?.();
  }, [onChange, onClear]);

  return (
    <div className="space-y-2">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="input pl-9 pr-10"
          autoComplete="off"
          spellCheck={false}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-textSecondary hover:text-text"
            aria-label="Hapus pencarian"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
