/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#153b2d',
        moss: '#254f3a',
        ochre: '#d49a2a',
        terracotta: '#b55d3c',
        clay: '#f4eee2',
        wheat: '#f7d7a5',
        leaf: '#6b9c62',
        ember: '#d9734e'
      },
      boxShadow: {
        soft: '0 10px 25px rgba(21, 59, 45, 0.12)'
      }
    }
  },
  plugins: []
};
