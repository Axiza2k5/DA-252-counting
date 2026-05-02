// mobile-app/tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#001a3d',
          800: '#002f6c',
          600: '#0056b3',
          400: '#00a3ff',
        }
      }
    },
  },
  plugins: [],
}
