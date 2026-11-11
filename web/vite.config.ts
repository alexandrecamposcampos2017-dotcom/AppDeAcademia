import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll("\\", "/");
          if (normalizedId.includes("/node_modules/recharts/")) return "charts";
          if (normalizedId.includes("/node_modules/lucide-react/")) return "icons";
          if (normalizedId.includes("/node_modules/react/") || normalizedId.includes("/node_modules/react-dom/")) return "react";
          return undefined;
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
