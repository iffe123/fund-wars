import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@google/genai')) return 'genai';
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('howler')) return 'howler';
          if (id.includes('react')) return 'react';
          return 'vendor';
        },
      },
    },
  },
  server: {
    host: true,
  },
});
