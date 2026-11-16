/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages の公開先（https://<ユーザー>.github.io/hand-odds/）。リポジトリ名を変えたらここも変える
  base: '/hand-odds/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // import 文で "@/..." を src/ からのパスとして使う（tsconfig の paths と同じ設定）
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // ブラウザの DOM を模擬した環境でテストする
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
