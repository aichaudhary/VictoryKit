/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // XDRPlatform Brand Colors - Cyan/Teal Theme
        log: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        dark: {
          100: '#1e293b',
          200: '#0f172a',
          300: '#0a101f',
          400: '#060912',
        },
        // Log level colors
        debug: '#8b5cf6',
        info: '#3b82f6',
        warn: '#f59e0b',
        error: '#ef4444',
        fatal: '#dc2626',
      },
      backgroundImage: {
        'log-gradient': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
        'log-dark': 'linear-gradient(180deg, #0f172a 0%, #0c1a2a 50%, #0f172a 100%)',
        'log-glow': 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
        'log-card': 'linear-gradient(145deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
      },
      boxShadow: {
        'log': '0 0 20px rgba(6, 182, 212, 0.3)',
        'log-lg': '0 0 40px rgba(6, 182, 212, 0.4)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.5)',
      },
      animation: {
        'pulse-log': 'pulseLog 2s ease-in-out infinite',
        'stream': 'stream 1s linear infinite',
        'log-scroll': 'logScroll 20s linear infinite',
      },
      keyframes: {
        pulseLog: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.6)' },
        },
        stream: {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        logScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
