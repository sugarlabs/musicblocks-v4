import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [tailwindcss()],
    resolve: {
        alias: {
            '@': resolve(dir, './src'),
            '@res': resolve(dir, '../../res'),
        },
        extensions: ['.tsx', '.ts', '.js', '.scss', '.sass', '.json'],
    },
});
