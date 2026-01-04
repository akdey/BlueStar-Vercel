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
        primary: "rgb(var(--primary) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        'brand-gray': "var(--bg-dark-accent)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
        'hero-gradient': 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FA 100%)',
        'hero-gradient-dark': 'linear-gradient(135deg, #1B262C 0%, #0F4C75 100%)',
      }
    },
  },
  plugins: [],
}
