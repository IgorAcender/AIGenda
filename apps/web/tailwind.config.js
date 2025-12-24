/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.{ejs,html}",
    "./src/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
