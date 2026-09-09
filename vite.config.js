import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'permissions-policy',
      transformIndexHtml(html) {
        if (!html.includes('Permissions-Policy')) {
          return html.replace(
            '<meta name="viewport"',
            '<meta name="viewport">\n  <meta http-equiv="Permissions-Policy" content="unload=*">'
          );
        }
        return html;
      },
    },
    {
      name: 'copy-static-assets',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
        writeFileSync(resolve(dist, '.nojekyll'), '');
        cpSync(resolve(__dirname, 'js'), resolve(dist, 'js'), { recursive: true });
        cpSync(resolve(__dirname, 'data'), resolve(dist, 'data'), { recursive: true });
        cpSync(resolve(__dirname, 'common-chars.json'), resolve(dist, 'common-chars.json'));
        const faviconSrc = resolve(__dirname, 'public', 'favicon.ico');
        if (existsSync(faviconSrc)) {
          cpSync(faviconSrc, resolve(dist, 'favicon.ico'));
        }
      },
    },
  ],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
  },
});
