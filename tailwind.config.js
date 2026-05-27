/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#1a7a2e',
          light: '#25a33d',
          glow: '#2ecc5a',
        },
        gold: {
          DEFAULT: '#c8922a',
          light: '#e8b84b',
        },
        dark: {
          DEFAULT: '#0e1a10',
          2: '#152018',
        },
        surface: {
          DEFAULT: '#1c2e1e',
          2: '#243527',
        },
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        barlow: ['Barlow', 'sans-serif'],
        condensed: ['Barlow Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
