import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Webese core blue scheme (unchanged — used by non-Spinupfy pages)
        primary: {
          DEFAULT: 'var(--color-primary, #2563eb)',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: 'var(--color-primary, #3b82f6)',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #0ea5e9)',
          500: 'var(--color-secondary, #0ea5e9)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #06b6d4)',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: 'var(--color-accent, #06b6d4)',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },

        // ── Spinupfy brand palette ─────────────────────────────
        // Extracted from the Spinupfy logo:
        //   Primary purple  → #7C35B8  (border, icons, CTAs)
        //   Light pink      → #FAD8F0  (logo fill / card backgrounds)
        //   Dark purple     → #5B1E90  (hover, headings)
        spinupfy: {
          50:  '#FDF5FB',   // near-white lavender tint
          100: '#FAE8F5',   // very light pink (card bg, subtle fills)
          200: '#F4C8E8',   // light pink
          300: '#E89DD4',   // medium pink
          400: '#D46EBC',   // pink-purple
          500: '#B845A2',   // vibrant purple-pink
          600: '#9B35B0',   // medium purple
          700: '#7C35B8',   // ← PRIMARY (matches logo border/icons exactly)
          800: '#5B1E90',   // dark purple (hovers, headings)
          900: '#3D1066',   // very dark purple
          950: '#260A42',   // near-black purple (dark backgrounds)
        },

        // Convenience aliases used throughout Spinupfy components
        'sp-pink':  '#FAD8F0',  // logo light-pink fill
        'sp-purple': '#7C35B8', // logo primary purple
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Spinupfy brand gradients
        'spinupfy-gradient': 'linear-gradient(135deg, #7C35B8 0%, #B845A2 100%)',
        'spinupfy-soft':     'linear-gradient(135deg, #FAE8F5 0%, #F4C8E8 100%)',
        'spinupfy-dark':     'linear-gradient(135deg, #3D1066 0%, #5B1E90 100%)',
      },
      boxShadow: {
        'spinupfy': '0 4px 24px 0 rgba(124, 53, 184, 0.25)',
        'spinupfy-lg': '0 8px 40px 0 rgba(124, 53, 184, 0.35)',
        'spinupfy-glow': '0 0 0 3px rgba(124, 53, 184, 0.30)',
      },
    },
  },
  plugins: [],
}

export default config
