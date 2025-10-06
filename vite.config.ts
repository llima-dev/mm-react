import { defineConfig } from 'vitest/config'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: "/mm-react/",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
