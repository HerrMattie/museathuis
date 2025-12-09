/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}" // Voor de zekerheid
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
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
