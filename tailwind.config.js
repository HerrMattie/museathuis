import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#050a14', // Iets dieper zwart-blauw
          900: '#0f172a', // Rijke achtergrondkleur
          800: '#1e293b', // Panelen / Cards
          700: '#334155', // Borders
        },
        museum: {
          gold: '#C5A059', // Iets gedempter goud (chiquer)
          lime: '#D9F99D', // Zachter lime voor accenten
          text: {
            primary: '#F1F5F9', // Off-white (leest rustiger)
            secondary: '#94A3B8', // Muted text
          }
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
