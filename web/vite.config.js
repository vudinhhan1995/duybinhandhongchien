import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  // Tuyệt đối, KHÔNG dùng './': đường dẫn tương đối làm asset 404 khi thiệp
  // được mở bằng link có phần đường dẫn (vd /thiepcuoi, hoặc bản gốc
  // ewedinvite.online/DUYBINH&HONGCHIEN.html) → trang trắng.
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
