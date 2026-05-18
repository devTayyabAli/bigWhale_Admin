/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    // Add xs breakpoint below Tailwind's default sm (640px)
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        bw: {
          primary:        '#00D2FF',
          secondary:      '#007CF0',
          dark:           '#0A0F1C',
          darker:         '#060B14',
          card:           '#111827',
          surface:        '#1F2937',
          border:         '#374151',
          muted:          '#6B7280',
          text:           '#F9FAFB',
          'text-secondary': '#9CA3AF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'bw-gradient':      'linear-gradient(135deg, #00D2FF 0%, #007CF0 100%)',
        'bw-gradient-dark': 'linear-gradient(135deg, #0A0F1C 0%, #111827 100%)',
        'card-gradient':    'linear-gradient(145deg, rgba(31,41,55,0.8) 0%, rgba(17,24,39,0.9) 100%)',
        'glow-primary':     'radial-gradient(circle at center, rgba(0,210,255,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'bw':         '0 4px 24px rgba(0, 210, 255, 0.12)',
        'bw-lg':      '0 8px 40px rgba(0, 210, 255, 0.2)',
        'card':       '0 2px 16px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
        'glow':       '0 0 20px rgba(0, 210, 255, 0.3)',
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      // Support 100dvh (dynamic viewport height) for mobile browsers
      height: {
        'screen-dvh': '100dvh',
      },
      minHeight: {
        'screen-dvh': '100dvh',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      // Spacing for safe area insets
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
}
