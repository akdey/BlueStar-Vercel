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
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        'brand-gray': "var(--bg-dark-accent)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #F7F9FC 0%, #E8F0FA 100%)',
        'hero-gradient-dark': 'linear-gradient(135deg, #1B262C 0%, #0F4C75 100%)',
      }
    },
  },
  plugins: [],
}
