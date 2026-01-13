import { defineConfig } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/functions/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    outDir: 'dist-worker',
    emptyOutDir: true,
    rollupOptions: {
      // Ensure it's bundled as a single file and externalizes nothing unless necessary
      external: [],
    },
  },
  publicDir: false,
  resolve: {
    alias: {
      // Add any aliases if needed
    }
  },
  define: {
    // Inject environment variables
    'process.env.AMAP_SECURITY_KEY': JSON.stringify(process.env.AMAP_SECURITY_KEY),
    'process.env.SERVER3_SEND_KEY': JSON.stringify(process.env.SERVER3_SEND_KEY),
    'process.env.ENVIRONMENT': JSON.stringify(process.env.ENVIRONMENT || 'production'),
  },
});
