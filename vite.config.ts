import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router-dom",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },

  build: {
    // Raise warning threshold — we know the bundle is large during transition
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // ── Vendor: React core ───────────────────────────────────────
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // ── Supabase ─────────────────────────────────────────────────
          if (id.includes("node_modules/@supabase/")) {
            return "vendor-supabase";
          }

          // ── Framer Motion (heavy — ~180KB gz) ────────────────────────
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-framer";
          }

          // ── Radix UI primitives ──────────────────────────────────────
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }

          // ── Recharts + D3 dependencies ───────────────────────────────
          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/d3-") ||
            id.includes("node_modules/victory-vendor/")
          ) {
            return "vendor-charts";
          }

          // ── TanStack Query ───────────────────────────────────────────
          if (id.includes("node_modules/@tanstack/")) {
            return "vendor-query";
          }

          // ── Admin panel (large, rarely visited) ──────────────────────
          if (
            id.includes("/src/pages/admin/") ||
            id.includes("/src/components/admin/")
          ) {
            return "chunk-admin";
          }

          // ── Portal pages ─────────────────────────────────────────────
          if (
            id.includes("/src/pages/portal/") ||
            id.includes("/src/contexts/PortalAuthContext") ||
            id.includes("/src/lib/portalAuth")
          ) {
            return "chunk-portal";
          }

          // ── Partner proposal forms ───────────────────────────────────
          if (id.includes("/src/pages/partners/")) {
            return "chunk-partners";
          }

          // ── Lucide icons (large if not tree-shaken) ──────────────────
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-icons";
          }

          // ── Other node_modules → vendor-misc ────────────────────────
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
  },

  // Dev server — preserve existing host/port settings
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: true },
  },

  // Pre-bundle heavy deps for faster cold starts in dev
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "@supabase/supabase-js",
      "lucide-react",
    ],
  },
}));
