import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    // 消除 html2pdf.js / jsPDF 的 Permissions Policy unload 警告
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
        // Prevent GitHub Pages Jekyll processing (critical: without this JS files may break)
        writeFileSync(resolve(dist, '.nojekyll'), '');
        // Copy legacy JS modules the React app depends on via window.__copybook__
        cpSync(resolve(__dirname, 'js'), resolve(dist, 'js'), { recursive: true });
        // Copy data files
        cpSync(resolve(__dirname, 'data'), resolve(dist, 'data'), { recursive: true });
        // Copy common-chars.json (fetched by App at runtime)
        cpSync(resolve(__dirname, 'common-chars.json'), resolve(dist, 'common-chars.json'));
        // Copy favicon
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
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
  },
});
