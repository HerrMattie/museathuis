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
        // Midnight Modern Palette
        midnight: {
          950: '#0B1120', // Zeer diep blauw/zwart (Achtergrond)
          900: '#0F172A', // Iets lichter (Kaarten/Panelen)
          800: '#1E293B', // Hover states
        },
        museum: {
          gold: '#D4AF37', // Klassiek goud (voor details)
          lime: '#CCF381', // Electric Lime (voor Call to Actions)
          coral: '#FF6B6B', // Secundair accent
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'], // Voor koppen
        sans: ['var(--font-inter)', 'sans-serif'], // Voor tekst
      },
    },
  },
  plugins: [],
};
export default config;
