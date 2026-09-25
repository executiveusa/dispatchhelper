import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        landing: path.resolve(import.meta.dirname, "index.html"),
      },
    },
  },
});
