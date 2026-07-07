import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-nivo": ["@nivo/core", "@nivo/funnel"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-radix": [
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-slot"
          ]
        }
      }
    }
  },
  server: {
    watch: {
      // Polling ensures file changes are detected through Docker volume mounts
      usePolling: true
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    testTimeout: 10000
  }
});
