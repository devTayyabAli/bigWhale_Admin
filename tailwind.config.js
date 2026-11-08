/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── BW Brand ──────────────────────────────────────────────────
        'bw-primary':   '#00D2FF',
        'bw-secondary': '#007CF0',
        'bw-accent':    '#0EA5E9',

        // ── Backgrounds ───────────────────────────────────────────────
        'bw-bg':       '#0A0F1C',   // page background
        'bw-surface':  '#111827',   // elevated surface (cards, inputs)
        'bw-card':     '#111827',   // card background
        'bw-overlay':  '#1F2937',   // modals / dropdowns

        // ── Borders ───────────────────────────────────────────────────
        'bw-border':   '#1F2937',

        // ── Text ──────────────────────────────────────────────────────
        'bw-text':           '#F9FAFB',   // primary text
        'bw-text-secondary': '#9CA3AF',   // secondary / subdued text
        'bw-muted':          '#6B7280',   // placeholder / muted text

        // ── Status ────────────────────────────────────────────────────
        'bw-success': '#10B981',
        'bw-warning': '#F59E0B',
        'bw-error':   '#EF4444',
        'bw-info':    '#3B82F6',
      },

      backgroundImage: {
        // Used as `bg-bw-gradient` and `bg-bw-gradient` in e.g. buttons / logo
        'bw-gradient': 'linear-gradient(135deg, #00D2FF 0%, #007CF0 100%)',
      },

      boxShadow: {
        'bw':      '0 0 20px rgba(0, 210, 255, 0.3)',
        'bw-lg':   '0 0 40px rgba(0, 210, 255, 0.4)',
        'card':    '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to:   { transform: 'translateX(0)' },
        },
      },

      animation: {
        shimmer:  'shimmer 1.5s infinite linear',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
