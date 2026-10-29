/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D6F42',
        primaryHover: '#175B36',
        bg: '#F6F5F0',
        card: '#FFFFFF',
        text: '#1C1C1A',
        textSecondary: '#5F5E57',
        border: '#E3E1D8',
        inputBorder: '#D9D6CA',
        excel: '#1D6F42',
        word: '#2B579A',
        powerpoint: '#B8391A',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        button: '10px',
        input: '10px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
