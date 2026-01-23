/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Ocean Mist - Accent color for buttons, highlighted text
        neuro: {
          50: '#E0F7F4',
          100: '#B3EBE3',
          200: '#80DFD1',
          300: '#4DD3BF',
          400: '#26C7B0',
          500: '#1FC7B2',  // PRIMARY - Ocean Mist
          600: '#1AB39E',
          700: '#149D8A',
          800: '#0E8776',
          900: '#076152',
          950: '#00555A',  // Dark Teal for hover states
        },
        // Dark Teal - Secondary elements, hover states
        teal: {
          50: '#E0F2F3',
          100: '#B3DEE0',
          200: '#80C9CD',
          300: '#4DB4BA',
          400: '#269FA7',
          500: '#00555A',  // Dark Teal
          600: '#004A4F',
          700: '#003F44',
          800: '#003439',
          900: '#00292E',
        },
        // Jet Black - Main background
        jet: {
          50: '#E5EAEB',
          100: '#B8C5C7',
          200: '#8AA0A3',
          300: '#5C7B7F',
          400: '#2E565B',
          500: '#0C2F34',  // Jet Black
          600: '#0A272B',
          700: '#081F22',
          800: '#061719',
          900: '#040F10',
        },
        // Surface colors with Jet Black base
        surface: {
          50: '#F5F7F8',   // Light page background
          100: '#E8ECED',  // Card hover
          200: '#D1D9DB',  // Borders
        },
      }
    },
  },
  plugins: [],
}
