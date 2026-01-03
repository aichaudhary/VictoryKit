/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bot-primary': '#FF6B35',
        'bot-secondary': '#004E89',
        'bot-danger': '#EF4444',
        'bot-success': '#22C55E',
        'bot-warning': '#F59E0B',
        'bot-info': '#3B82F6',
        'dark': {
          100: '#1E293B',
          200: '#0F172A',
          300: '#020617',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
};
