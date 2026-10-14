import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // ใช้ alias บังคับเส้นทางแบบ Hardcode
    alias: {
      "y-prosemirror": path.resolve(
        process.cwd(),
        "node_modules/y-prosemirror",
      ),
      "y-protocols": path.resolve(process.cwd(), "node_modules/y-protocols"),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ดักจับไลบรารี Yjs ecosystem ทั้งหมด รวมถึง quill เข้าไปในก้อนเดียวกัน
          if (
            id.includes("yjs") ||
            id.includes("y-websocket") ||
            id.includes("y-prosemirror") ||
            id.includes("y-protocols") ||
            id.includes("quill")
          ) {
            return "editor-vendor";
          }
          // แยกไลบรารี UI หรือ Icon
          if (id.includes("@iconify") || id.includes("lucide-react")) {
            return "icons-vendor";
          }
          // แยกไลบรารีพื้นฐานของ React
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "react-vendor";
          }
        },
      },
    },
  },
});
