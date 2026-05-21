/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#FFD700",
          "gold-light": "#FFF9D4",
          "gold-dark": "#E6C200",
          yellow: "#FFEA79",
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Noto Sans KR', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.01)',
        'premium-hover': '0 20px 40px -15px rgba(255, 215, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
