import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { UserConfig } from 'vite';

import { defineConfig, mergeConfig } from 'vitest/config';

import rootConfig from '../../vitest.config';

const dir = dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
    rootConfig as UserConfig,
    defineConfig({
        resolve: {
            alias: {
                '#/@types': resolve(dir, '../../@types'),
            },
            extensions: ['.tsx', '.ts', '.js', '.scss', '.sass', '.json'],
        },
        test: {
            environment: 'jsdom',
            setupFiles: ['./vitest.setup.dom.ts'],
        },
    }),
);
