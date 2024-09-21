/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("wc-"),
        },
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    legacy(),
  ],
  define: {
    COMMIT_COUNT: JSON.stringify(process.env.COMMIT_COUNT),
    COMMIT_HASH: JSON.stringify(process.env.COMMIT_HASH),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
  server: {
    proxy: {
      "/itinisere": {
        target: "https://www.itinisere.fr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/itinisere/, ""),
      },
    },
  },
})
