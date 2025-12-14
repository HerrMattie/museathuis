/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Sans = Inter (voor broodtekst)
        sans: ["var(--font-inter)", "sans-serif"],
        // Serif = Playfair Display (voor koppen - veel beter leesbaar!)
        serif: ["var(--font-serif)", "serif"], 
      },
      colors: {
        'midnight': {
          900: '#0f172a', // Slate 900
          950: '#020617', // Slate 950 (zeer donker blauw/zwart)
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
