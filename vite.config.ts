import react from "@vitejs/plugin-react";
import { seedDesignPlugin } from "@seed-design/vite-plugin";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    seedDesignPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Wordseed — TOEFL Vocabulary",
        short_name: "Wordseed",
        description: "문맥으로 모으고, 반복해서 기억하는 TOEFL 단어장",
        theme_color: "#ff6f0f",
        background_color: "#f7f8fa",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,woff2}"]
      }
    })
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "seed-design": new URL("./seed-design", import.meta.url).pathname
    }
  },
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    coverage: { reporter: ["text", "json", "html"] }
  }
});
