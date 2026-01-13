import { defineConfig } from 'tsup';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

export default defineConfig({
  entry: ['src/functions/index.ts'],
  format: ['esm'],
  outDir: 'dist-worker',
  clean: true,
  minify: true,
  bundle: true,
  dts: false,
  sourcemap: false,
  noExternal: [/.*/], // Bundle all dependencies into the single file
  define: {
    // Inject environment variables at build time
    'process.env.AMAP_SECURITY_KEY': JSON.stringify(process.env.AMAP_SECURITY_KEY),
    'process.env.SERVER3_SEND_KEY': JSON.stringify(process.env.SERVER3_SEND_KEY),
    'process.env.ENVIRONMENT': JSON.stringify(process.env.ENVIRONMENT || 'production'),
  },
  // Ensure we get a single file output
  splitting: false,
  treeshake: true,
  // Equivalent of publicDir: false in Vite (tsup doesn't copy public by default)
});
