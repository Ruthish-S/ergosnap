import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Base path for GitHub Pages deployment:
// Repository: github.com/Ruthish-S/ergosnap
// Hosted at:  https://ruthish-s.github.io/ergosnap/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/ergosnap/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.ts', 'src/test/**/*.test.tsx'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/modules/**', 'src/data/**'],
    },
  },
});
