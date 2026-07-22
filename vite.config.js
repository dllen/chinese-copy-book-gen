import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-static-assets',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        // Prevent GitHub Pages Jekyll processing (critical: without this JS files may break)
        writeFileSync(resolve(dist, '.nojekyll'), '');
        // Copy legacy JS modules the React app depends on via window.__copybook__
        cpSync(resolve(__dirname, 'js'), resolve(dist, 'js'), { recursive: true });
        // Copy data files
        cpSync(resolve(__dirname, 'data'), resolve(dist, 'data'), { recursive: true });
        // Copy common-chars.json (fetched by App at runtime)
        cpSync(resolve(__dirname, 'common-chars.json'), resolve(dist, 'common-chars.json'));
      },
    },
  ],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
  },
});
