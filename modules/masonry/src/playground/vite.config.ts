import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vite';

import baseConfig from '../../vite.config';

export default mergeConfig(
    baseConfig,
    defineConfig({
        plugins: [react()],
    }),
);
