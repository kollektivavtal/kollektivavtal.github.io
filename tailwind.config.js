/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.njk", "./_includes/*.njk"],
  theme: {
    extend: {
      colors: {
        bgStart: 'rgba(5, 9, 15, 1)', // Corresponds to rgb(5,9,15)
        bgEnd: 'rgba(10, 19, 44, 1)', // Corresponds to rgba(10,19,44,1)
      },
    },
  },
  plugins: [],
}

