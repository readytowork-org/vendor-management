import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { powerApps } from "@microsoft/power-apps-vite/plugin";

// https://vite.dev/config/
export default defineConfig({
  // Power Apps serves the built app from a versioned sub-path, so asset URLs
  // must be relative.
  base: "./",
  plugins: [react(), powerApps()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // `buildPath` in power.config.json must match this.
    outDir: "dist",
  },
});
