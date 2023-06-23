import type { UserConfigExport } from 'vite';

import path from 'path';
import { mergeConfig } from 'vite';

// -------------------------------------------------------------------------------------------------

function resolve(rootPath: string) {
    return path.resolve(__dirname, '..', rootPath);
}

export default {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(tsx|ts|jsx|js)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    docs: {
        autodocs: 'tag',
    },
    async viteFinal(config: UserConfigExport) {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    '@': resolve('src'),
                    '@res': resolve('../../res'),
                },
                extensions: ['.tsx', '.ts', '.js', '.scss', '.sass', '.json'],
            },
        });
    },
};
