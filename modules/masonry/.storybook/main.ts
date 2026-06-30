import type { UserConfig } from 'vite';

import { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

import baseConfig from '../vite.config';

// -------------------------------------------------------------------------------------------------

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(tsx|ts|jsx|js)'],
    addons: ['@storybook/addon-a11y'],
    framework: {
        name: '@storybook/react-vite',
        options: {
            strictMode: true,
        },
    },
    async viteFinal(config: UserConfig) {
        return mergeConfig(config, baseConfig);
    },
};

export default config;
