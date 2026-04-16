/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E0FBF7',
          100: '#A3F3E5',
          200: '#5DEAD0',
          300: '#1DD6B8',
          400: '#00C2A8',
          500: '#00A891',
          600: '#008C78',
          700: '#006F5F',
          800: '#005448',
          900: '#003A32',
        },
        navy: {
          900: '#0D1B2A',
          800: '#132940',
          700: '#1B3A5C',
          600: '#254D78',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
