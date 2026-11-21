import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      allowedHosts: ["athenks.onrender.com", ".onrender.com"],
    },
    preview: {
      allowedHosts: ["athenks.onrender.com", ".onrender.com"],
    },
  },
});