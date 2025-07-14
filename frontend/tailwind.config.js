/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        amazonClone: {
          background: '#EAEDED',
          light_blue: '#232F3A',
          yellow: '#FEB069',
          amazon_yellow: '#FFD814',
          amazon_yellow_hover: '#F7CA00',
          amazon_blue: '#37475A',
          amazon_footer: '#232F3E',
          DEFAULT: '#131921',
        },
      },
    },
  },
  plugins: [],
};
