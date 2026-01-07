/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ssl: {
          primary: '#10B981',    // Emerald/Green
          secondary: '#059669',
          accent: '#34D399',
          dark: '#0F172A',
          darker: '#020617',
          surface: '#1E293B',
          border: '#334155',
        }
      },
    },
  },
  plugins: [],
}
