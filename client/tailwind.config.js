/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0F172A', // Slate 900
                secondary: '#1E293B', // Slate 800
                accent: '#38BDF8', // Sky 400
                success: '#10B981', // Emerald 500
                warning: '#F59E0B', // Amber 500
                danger: '#EF4444', // Red 500
            }
        },
    },
    plugins: [],
}
