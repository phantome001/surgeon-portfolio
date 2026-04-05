import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#c8a96e', light: '#e8d4a0' },
        teal: { DEFAULT: '#2dd4bf', light: '#99f6e4' },
        navy: {
          900: '#060c18',
          800: '#0d1626',
          700: '#111e35',
          600: '#162035',
        },
        surface: { DEFAULT: '#162035', 2: '#1e2d47' },
        surface2: '#1e2d47',
        text: '#e8edf5',
        muted: '#7a8ba8',
      },
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-gold': 'pulse-gold 2s infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
