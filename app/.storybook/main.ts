import type { UserConfig } from 'vite';

import path from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';

// -------------------------------------------------------------------------------------------------

function resolve(rootPath: string) {
    return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', rootPath);
}
export default {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(tsx|ts|jsx|js)'],
    addons: ['@storybook/addon-a11y'],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
    async viteFinal(config: UserConfig) {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    '@': resolve('src'),
                    '@res': resolve('../res'),
                },
                extensions: ['.tsx', '.ts', '.js', '.scss', '.sass', '.json'],
            },

            envDir: resolve('env'),

            build: {
                chunkSizeWarningLimit: 1024,
            },
        });
    },
};
