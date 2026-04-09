import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // Proxy API sang backend HTTP để tránh lỗi cert HTTPS localhost
        target: "http://localhost:5104",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5104",
        changeOrigin: true,
      },
    },
  },
});
