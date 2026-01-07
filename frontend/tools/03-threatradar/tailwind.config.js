/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        threatradar: {
          primary: '#EF4444',      // Red - danger/threats
          secondary: '#DC2626',    // Darker red
          accent: '#F87171',       // Light red
          dark: '#1E293B',
          darker: '#0F172A',
          warning: '#F59E0B',
          critical: '#DC2626',
          high: '#EF4444',
          medium: '#F59E0B',
          low: '#22C55E',
        },
      },
      backgroundImage: {
        'threat-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'radar-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-red-lg': '0 0 40px rgba(239, 68, 68, 0.5)',
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        "radar-sweep": "radar-sweep 4s linear infinite",
        "threat-pulse": "threat-pulse 1.5s ease-in-out infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(239, 68, 68, 0.6)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "threat-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
