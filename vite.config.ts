import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // Raise the warning threshold slightly — individual page chunks are fine up to 600kB
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, changes rarely → very long cache lifetime
          "vendor-react": ["react", "react-dom"],
          // Router — separate so route changes don't bust the React chunk
          "vendor-router": ["react-router-dom"],
        },
      },
    },
  },
});
