/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // rubik: ['Rubik_400Regular'],
        // rubikMedium: ['Rubik_500Medium'],
        rubikBold: ['Rubik-Bold'],
      },
    },
  },
  plugins: [],
}