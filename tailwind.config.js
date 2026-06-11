/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0bd46c',
        secondary: '#408552',
        tertiary: '#ff9e76',
        neutral: '#707a6f',
        dark: '#02140f',
      },
    },
  },
  plugins: [],
}