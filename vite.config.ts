/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"
import { defineConfig } from "vite"
import { version } from "./package.json"
import { execSync } from "child_process"

// NOTE: The hash is lagging one version behind
const count = +execSync("git rev-list --count HEAD").toString().trim() + 1
const hash = execSync("git rev-parse --short HEAD").toString().trim()
const vhash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
const VERSION = vhash ? `${version.split("-")[0]}-${vhash}` : `${count}.0.0-${hash}`
if (VERSION !== version) execSync(`npm version ${VERSION} --no-git-tag-version`)

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
      srcDir: "src",
      filename: "service-worker.js"
      manifest: {
        theme_color: "#f6f7f7",
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
