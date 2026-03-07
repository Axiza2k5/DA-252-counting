/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
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
