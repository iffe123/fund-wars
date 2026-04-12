import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.info', 'console.debug'],
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // No external AI SDK - using direct fetch to Anthropic API
          if (id.includes('firebase')) return 'firebase';
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
