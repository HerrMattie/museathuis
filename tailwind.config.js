/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. ZORG DAT DEZE REGEL HIER STAAT:
  darkMode: ["class"], 
  
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"], 
      },
      colors: {
        'midnight': {
          900: '#0f172a',
          950: '#020617', // Jouw donkerblauw
        },
        'museum-gold': '#d4af37',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
};
