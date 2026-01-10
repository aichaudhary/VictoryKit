import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 3003,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:4003",
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://localhost:4003",
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
