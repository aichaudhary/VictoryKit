/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vuln: {
          primary: "#3B82F6",
          secondary: "#2563EB",
          accent: "#60A5FA",
          dark: "#1A1A2E",
          darker: "#0F0F1A",
        },
      },
      backgroundImage: {
        "vuln-gradient": "linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)",
        "scan-gradient": "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
        "critical-gradient": "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.4)",
        "glow-blue-lg": "0 0 40px rgba(59, 130, 246, 0.6)",
        "glow-critical": "0 0 30px rgba(239, 68, 68, 0.5)",
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite alternate",
        vulnPulse: "vulnPulse 2s ease-in-out infinite",
        scanLine: "scanLine 1.5s ease-in-out infinite",
        targetLock: "targetLock 0.5s ease-out forwards",
        severityPop: "severityPop 0.3s ease-out forwards",
        portScan: "portScan 0.8s ease-out",
        "radar-sweep": "radarSweep 3s linear infinite",
      },
      keyframes: {
        vulnPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        targetLock: {
          "0%": { transform: "scale(1.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        severityPop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        portScan: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" },
          "100%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" },
        },
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
