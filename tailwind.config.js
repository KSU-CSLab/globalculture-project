/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        everytime: {
          red: '#F59E0B', // Amber / Warm Golden Yellow
          bg: '#F9F9F9',
          border: '#ECECEC',
          textMain: '#292929',
          textSub: '#A6A6A6',
          blueBg: '#E8F2FF',
          blueText: '#2563EB',
        }
      }
    },
  },
  plugins: [],
}
