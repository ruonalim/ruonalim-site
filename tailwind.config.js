/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#080808',
          text: '#ffffff',
          accent: '#2563eb',
          border: 'rgba(255,255,255,0.07)',
          muted: 'rgba(255,255,255,0.45)',
          dim: 'rgba(255,255,255,0.25)',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
