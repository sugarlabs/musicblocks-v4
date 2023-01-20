const path = require('path');

const { mergeConfig } = require('vite');

// -------------------------------------------------------------------------------------------------

function resolve(rootPath) {
    return path.resolve(__dirname, '..', rootPath);
}

module.exports = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(tsx|ts|jsx|js)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
    ],
    framework: '@storybook/react',
    core: {
        builder: '@storybook/builder-vite',
    },
    async viteFinal(config) {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    '@': resolve('src'),
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
