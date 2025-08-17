import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dynamically extract Gitpod workspace hostname
const workspaceUrl = process.env.GITPOD_WORKSPACE_URL?.replace(
  /^https?:\/\//,
  "",
);
const exposedHost = workspaceUrl ? `5173-${workspaceUrl}` : undefined;

export default defineConfig({
  plugins: [react()],

  // Client lives here
  root: "src/client",

  // 🔑 Load env files from the REPO ROOT (so .env works)
  envDir: process.cwd(),

  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
    sourcemap: false,
  },

  server: {
    host: true,
    strictPort: true,
    origin: exposedHost ? `https://${exposedHost}` : undefined,
    allowedHosts: exposedHost ? [exposedHost] : [],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
