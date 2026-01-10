/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        phish: {
          primary: "#F97316",
          secondary: "#EA580C",
          accent: "#FB923C",
          dark: "#1A1A2E",
          darker: "#0F0F1A",
        },
      },
      backgroundImage: {
        "phish-gradient": "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)",
        "email-gradient": "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
        "warning-gradient": "linear-gradient(135deg, #EF4444 0%, #F97316 100%)",
      },
      boxShadow: {
        "glow-orange": "0 0 20px rgba(249, 115, 22, 0.4)",
        "glow-orange-lg": "0 0 40px rgba(249, 115, 22, 0.6)",
        "glow-warning": "0 0 30px rgba(239, 68, 68, 0.5)",
      },
      animation: {
        "glow": "glow 2s ease-in-out infinite alternate",
        "phish-hook": "phishHook 2s ease-in-out infinite",
        "email-scan": "emailScan 1.5s ease-in-out infinite",
        "warning-flash": "warningFlash 0.8s ease-in-out infinite",
        "link-trace": "linkTrace 2s linear infinite",
        "shield-pulse": "shieldPulse 2s ease-in-out infinite",
        "detection-slide": "detectionSlide 0.5s ease-out forwards",
        "hook-swing": "hookSwing 3s ease-in-out infinite",
      },
      keyframes: {
        phishHook: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        emailScan: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        warningFlash: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        linkTrace: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        shieldPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(251, 146, 60, 0.4)" },
          "50%": { boxShadow: "0 0 0 15px rgba(251, 146, 60, 0)" },
        },
        detectionSlide: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(249, 115, 22, 0.4)" },
          "100%": { boxShadow: "0 0 40px rgba(249, 115, 22, 0.8)" },
        },
        hookSwing: {
          "0%, 100%": { transform: "rotate(-10deg) translateY(0)" },
          "50%": { transform: "rotate(10deg) translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
