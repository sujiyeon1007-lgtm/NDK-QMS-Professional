import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  // Electron loadFile() requires relative asset paths; web/Beta keeps absolute "/".
  base: mode === "electron" ? "./" : "/",
  plugins: [react()],
  optimizeDeps: {
    include: ["xlsx"],
  },
  server: {
    allowedHosts: [".trycloudflare.com", ".ngrok-free.app"],
  },
}));
