/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#0C120C',
        red: {
          50: '#ffe7e6',
          100: '#f9bebb',
          200: '#f0958f',
          300: '#e96b63',
          400: '#e24236',
          500: '#c92a1d',
          600: '#9c1f16',
          700: '#70150f',
          800: '#440b07',
          900: '#1c0100',
        },
        green: {
          50: '#e2f9f4',
          100: '#c7e7df',
          200: '#a8d4c9',
          300: '#87c2b3',
          400: '#68b19e',
          500: '#4e9784',
          600: '#3b7667',
          700: '#28554a',
          800: '#13332c',
          900: '#00140e',
        },
        purple: {
          10: '#faf4f8',
          50: '#f6e9ff',
          100: '#ddc3f1',
          200: '#c49de3',
          300: '#ac75d6',
          400: '#954eca',
          500: '#7b35b0',
          600: '#60298a',
          700: '#441d63',
          800: '#2a103d',
          900: '#110419',
        },
      },
    },
    // fontFamily: fonts,
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
