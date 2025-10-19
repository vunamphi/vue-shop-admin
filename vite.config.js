import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // Cho phép truy cập từ bên ngoài (ngrok)
    port: 5173,      // Giữ nguyên cổng mặc định
  },
});
