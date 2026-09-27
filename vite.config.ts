import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { documentAssistHandler } from "./server/documentAssist.ts";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "AI_");
  const api = documentAssistHandler({ key: env.AI_API_KEY, baseUrl: env.AI_BASE_URL, model: env.AI_MODEL?.trim() || "gpt-5.6-luna", fixture: env.AI_DEMO_FIXTURE === "1" });
  return ({
  plugins: [
    { name: "document-assist-local-api", configureServer(server) { server.middlewares.use(api); }, configurePreviewServer(server) { server.middlewares.use(api); } },
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "favicon-48x48.png",
        "apple-touch-icon.png",
        "brand/gjakova-grants-logo-original.svg",
        "brand/gjakova-grants-symbol.svg",
      ],
      manifest: {
        id: "/gjakova-grants/",
        name: "Gjakova Grants",
        short_name: "Gjakova Grants",
        description: "Përgatitje e qartë e aplikimeve dhe shqyrtim komunal me të dhëna sintetike demonstrimi.",
        start_url: "/#/applicant/opportunities",
        scope: "/",
        display: "standalone",
        background_color: "#F8F8F7",
        theme_color: "#7A1F2B",
        lang: "sq",
        categories: ["government", "productivity"],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    host: "127.0.0.1",
  },
  });
});
