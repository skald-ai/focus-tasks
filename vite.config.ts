import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Относительные пути: сборка открывается и из корня домена,
  // и из подпапки GitHub Pages (https://<user>.github.io/<repo>/)
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
