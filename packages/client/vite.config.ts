import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3050,
    allowedHosts: ["hermes.local", ".local"],
    proxy: { "/api": "http://127.0.0.1:3051" }
  },
  build: { outDir: "dist", emptyOutDir: true }
});
