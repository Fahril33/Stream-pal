import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: 'popup.html',
        options: 'options.html',
        background: 'src/background/index.ts',
        content: 'src/content/index.ts',
        antiRedirect: 'src/content/antiRedirect.ts',
        inject: 'src/content/inject.ts',
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/chunks/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'assets/options.css';
          return 'assets/[name][extname]';
        },
      },
    },
  },
});
