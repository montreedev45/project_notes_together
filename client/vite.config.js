import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // ใช้ alias บังคับเส้นทางแบบ Hardcode
    alias: {
      'y-prosemirror': path.resolve(process.cwd(), 'node_modules/y-prosemirror'),
      'y-protocols': path.resolve(process.cwd(), 'node_modules/y-protocols')
    }
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
})
