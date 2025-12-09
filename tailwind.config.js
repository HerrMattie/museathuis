/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // We voegen 'src' toe voor de zekerheid, en maken de paden robuuster
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Voor het geval je een src map gebruikt
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",  // Soms zit UI code in lib
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617', // De diepe achtergrond
        },
        museum: {
          gold: '#C5A059',
          lime: '#D9F99D',
          text: {
            secondary: '#9CA3AF',
          }
        }
      },
      fontFamily: {
        // We zorgen voor fallbacks als de Google Fonts niet laden
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia', 'serif'],
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
