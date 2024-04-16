/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-1": "#F3F5F7",
        "bg-2": "#fff",
        "active-1": "#A1EDFD",
        "active-2": "#4D7FEE",
        "icon" :"#707C88",
        "main": "#4A5056",
        "outline": "#C4CBD7",
        "input-bg":"#F2F2F2"
      },
    },
  },
  plugins: [],
};
