import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],

  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },

  build: {
    // Raise warning threshold — we know the bundle is large during transition
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Simplified chunking strategy to avoid circular dependencies.
        // Previous config caused circular chunks (vendor-router <-> vendor-react
        // and chunk-partners <-> chunk-portal) which broke production loading
        // and resulted in a blank screen after deploy.
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            // Keep all React-related packages together to prevent React being
            // split across chunks (which causes "Cannot read properties of
            // undefined (reading 'createContext')" style errors).
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router") ||
              id.includes("node_modules/scheduler/") ||
              id.includes("node_modules/@remix-run/")
            ) {
              return "vendor-react";
            }

            if (id.includes("node_modules/@supabase/")) {
              return "vendor-supabase";
            }

            if (id.includes("node_modules/framer-motion/")) {
              return "vendor-framer";
            }

            if (id.includes("node_modules/@radix-ui/")) {
              return "vendor-radix";
            }

            if (
              id.includes("node_modules/recharts/") ||
              id.includes("node_modules/d3-") ||
              id.includes("node_modules/victory-vendor/")
            ) {
              return "vendor-charts";
            }

            if (id.includes("node_modules/@tanstack/")) {
              return "vendor-query";
            }

            if (id.includes("node_modules/lucide-react/")) {
              return "vendor-icons";
            }

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