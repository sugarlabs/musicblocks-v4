import type { UserConfig } from 'vite';

import { defineConfig, mergeConfig } from 'vitest/config';
import rootConfig from '../../vitest.config';

import path from 'path';

export default mergeConfig(
    rootConfig as UserConfig,
    defineConfig({
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        test: {
            projects: [
                {
                    extends: true,
                    test: {
                        name: 'unit',
                        include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
                        exclude: ['src/**/*.spec.tsx', 'src/**/*.test.tsx'],
                        environment: 'node',
                    },
                },
                {
                    extends: true,
                    test: {
                        name: 'dom',
                        include: ['src/**/*.spec.tsx', 'src/**/*.test.tsx'],
                        exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
                        environment: 'jsdom',
                        setupFiles: ['./vitest.setup.dom.ts'],
                    },
                },
            ],
        },
    }),
);
