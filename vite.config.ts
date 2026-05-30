import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

// GitHub Pages のサブパス配信に対応するため相対パス(base: "./")を使用。
// リポジトリ名に依存せずそのまま公開できる。
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon.svg"],
      manifest: {
        name: "つづくん - 習慣化アプリ",
        short_name: "つづくん",
        description: "怠惰な人でも続く、行動科学ベースの習慣化アプリ",
        theme_color: "#F2620E",
        background_color: "#FBF7F0",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        scope: ".",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        // OneSignal の SW は vite-plugin-pwa のキャッシュ対象から除外
        globIgnores: ["OneSignalSDKWorker.js"],
      },
    }),
  ],
})
