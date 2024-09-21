/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"
import { defineConfig } from "vite"
import { execSync } from "child_process"

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
    VERSION: JSON.stringify(execSync("git rev-list --count HEAD").toString().trim() + " // " + execSync("git rev-parse --short HEAD").toString().trim()),
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
