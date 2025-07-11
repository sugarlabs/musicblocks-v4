import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@code-builder': path.resolve(__dirname, '../../code-builder/src'),
    },
  },
}); 