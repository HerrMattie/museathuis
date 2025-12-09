/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // De donkere achtergrondkleuren
        midnight: {
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617', // De diepe achtergrond
        },
        // De accentkleuren
        museum: {
          gold: '#C5A059',
          lime: '#D9F99D', // Een zachte lime
          text: {
            secondary: '#9CA3AF', // Gray-400
          }
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
