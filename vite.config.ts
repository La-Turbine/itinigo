/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy"
import vue from "@vitejs/plugin-vue"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"
import { defineConfig } from "vite"
import { version } from "./package.json"
import { execSync } from "child_process"
import tailwindcss from "@tailwindcss/vite"

// NOTE: The hash is lagging one version behind
const count = +execSync("git rev-list --count HEAD").toString().trim() + 1
const hash = execSync("git rev-parse --short HEAD").toString().trim()
const vhash = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7)
const VERSION = vhash ? `${version.split("-")[0]}-${vhash}` : `${count}.0.0-${hash}`
if (VERSION !== version) execSync(`npm version ${VERSION} --no-git-tag-version`)

function versionJsonPlugin() {
  const body = JSON.stringify({ version: VERSION })
  return {
    name: "version-json",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/version.json") return next()
        res.setHeader("Content-Type", "application/json")
        res.setHeader("Cache-Control", "no-store")
        res.end(body)
      })
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "version.json", source: body })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    versionJsonPlugin(),
    tailwindcss(),
    react({ include: /\.tsx$/ }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("wc-"),
        },
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        importScripts: ["service-worker.js"],
        globIgnores: ["**/version.json"],
        runtimeCaching: [{ urlPattern: /\/version\.json$/, handler: "NetworkOnly" }],
      },
      manifest: {
        orientation: "portrait",
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
  define: {
    __VERSION__: JSON.stringify(VERSION),
  },
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
})
