/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        malware: {
          primary: '#A855F7',      // Purple - malware analysis
          secondary: '#9333EA',    // Darker purple
          accent: '#C084FC',       // Light purple
          dark: '#1E1B2E',
          darker: '#13111C',
          danger: '#EF4444',
          warning: '#F59E0B',
          safe: '#22C55E',
          scanning: '#3B82F6',
        },
      },
      backgroundImage: {
        'malware-gradient': 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
        'scan-gradient': 'linear-gradient(135deg, #13111C 0%, #1E1B2E 50%, #13111C 100%)',
        'danger-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-purple-lg': '0 0 40px rgba(168, 85, 247, 0.5)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        "virus-scan": "virusScan 2s ease-in-out infinite",
        "malware-pulse": "malwarePulse 1.5s ease-in-out infinite",
        "scan-beam": "scanBeam 1.5s linear infinite",
        "threat-alert": "threatAlert 0.5s ease-in-out",
        "file-process": "fileProcess 0.8s ease-out forwards",
        "glow": "glow 2s ease-in-out infinite",
        "quarantine": "quarantine 0.3s ease-out",
      },
      keyframes: {
        virusScan: {
          "0%, 100%": { transform: "translateY(0)", opacity: "1" },
          "50%": { transform: "translateY(-5px)", opacity: "0.7" },
        },
        malwarePulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4)" },
          "50%": { boxShadow: "0 0 0 15px rgba(239, 68, 68, 0)" },
        },
        scanBeam: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        threatAlert: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        fileProcess: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%, 100%": { filter: "drop-shadow(0 0 5px rgba(168, 85, 247, 0.5))" },
          "50%": { filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))" },
        },
        quarantine: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
