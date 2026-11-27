import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './404.html', './src/**/*.ts'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'sans-serif'],
        display: ['"Space Grotesk Variable"', 'sans-serif'],
        mono: ['"Fira Code Variable"', 'monospace'],
        brand: ['"Syne Variable"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          accent: '#8b5cf6',
          accentDark: '#5b21b6',
          success: '#10b981',
          error: '#ef4444',
        },
        surface: {
          DEFAULT: 'rgba(15, 23, 42, 0.6)',
          hover: 'rgba(30, 41, 59, 0.8)',
          border: 'rgba(255, 255, 255, 0.08)',
          light: '#ffffff',
        },
        base: {
          900: '#020617',
          950: '#000000',
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        'blob-reverse': 'blob-reverse 10s infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        'fade-up': 'fade-up 0.5s ease forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'blob-reverse': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-30px, 50px) scale(1.2)' },
          '66%': { transform: 'translate(20px, -20px) scale(0.8)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
} satisfies Config;
