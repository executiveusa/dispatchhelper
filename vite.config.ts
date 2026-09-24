
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  build: {\n    rollupOptions: {\n      input: {\n        landing: path.resolve(__dirname, "index.html"),\n        desk: path.resolve(__dirname, "desk.html"),\n      },\n    },\n  },\n  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
