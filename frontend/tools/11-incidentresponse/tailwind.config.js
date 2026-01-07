/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // IncidentResponse Brand Colors - Rose/Red Theme
        incident: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        primary: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        dark: {
          100: "#1e293b",
          200: "#0f172a",
          300: "#0a101f",
          400: "#060912",
        },
        // Alert severity colors
        critical: "#dc2626",
        high: "#f97316",
        medium: "#eab308",
        low: "#22c55e",
        info: "#3b82f6",
      },
      backgroundImage: {
        'incident-gradient': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
        'incident-dark': 'linear-gradient(180deg, #0f172a 0%, #1e1028 50%, #0f172a 100%)',
        'incident-glow': 'radial-gradient(ellipse at center, rgba(244, 63, 94, 0.15) 0%, transparent 70%)',
        'incident-card': 'linear-gradient(145deg, rgba(244, 63, 94, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
      },
      boxShadow: {
        'incident': '0 0 20px rgba(244, 63, 94, 0.3)',
        'incident-lg': '0 0 40px rgba(244, 63, 94, 0.4)',
        'glow-rose': '0 0 30px rgba(244, 63, 94, 0.5)',
        'alert-critical': '0 0 20px rgba(220, 38, 38, 0.5)',
        'alert-high': '0 0 20px rgba(249, 115, 22, 0.5)',
      },
      animation: {
        'pulse-incident': 'pulseIncident 2s ease-in-out infinite',
        'alert-flash': 'alertFlash 1s ease-in-out infinite',
        'siren': 'siren 0.5s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseIncident: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(244, 63, 94, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(244, 63, 94, 0.6)' },
        },
        alertFlash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        siren: {
          '0%': { backgroundColor: 'rgba(220, 38, 38, 0.8)' },
          '100%': { backgroundColor: 'rgba(249, 115, 22, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
