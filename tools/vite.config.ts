import type { PluginOption } from 'vite';

import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteEjsPlugin as ejs } from 'vite-plugin-ejs';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';
import eslint from 'vite-plugin-eslint';
import { visualizer } from 'rollup-plugin-visualizer';

import { parse as parseJsonc } from 'jsonc-parser';

function resolve(rootPath: string) {
    return path.resolve(__dirname, '..', rootPath);
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        {
            name: 'plugin-jsonc',
            transform(src, id) {
                if (/\.(jsonc)$/.test(id)) {
                    const json = JSON.stringify(parseJsonc(src));
                    return {
                        code: `const content = ${json}; export default content;`,
                        map: null,
                    };
                }
            },
        },

        ejs({
            title: 'Music Blocks',
            description: 'A Musical Microworld',
        }),
        react(),

        pwa({
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            manifest: require(resolve('public/manifest.json')),
            manifestFilename: 'manifest.json',
            registerType: 'autoUpdate',
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
            },
        }),
        compression({
            algorithm: 'gzip',
        }),

        eslint(),
        visualizer({
            emitFile: true,
            filename: 'stats.html',
            gzipSize: true,
        }) as PluginOption,
    ],

    resolve: {
        alias: {
            '@': resolve('src'),
        },
        extensions: ['.tsx', '.ts', '.js', '.scss', '.sass', '.json'],
    },

    envDir: resolve('env'),

    build: {
        chunkSizeWarningLimit: 1024,
        sourcemap: true,
        rollupOptions: {
            input: {
                'index': resolve('index.html'),
                'lang.en': resolve('src/core/i18n/lang/en.ts'),
                'lang.es': resolve('src/core/i18n/lang/es.ts'),
                'module.menu': resolve('src/components/menu/index.ts'),
                'module.editor': resolve('src/components/editor/index.ts'),
                'module.painter': resolve('src/components/painter/index.ts'),
                'module.singer': resolve('src/components/singer/index.ts'),
                'core.assets': resolve('src/core/assets/index.ts'),
                'core.config': resolve('src/core/config/index.ts'),
                'core.i18n': resolve('src/core/i18n/index.ts'),
                'core.view': resolve('src/core/view/index.ts'),
            },
            output: {
                entryFileNames:"assets/[name].js",
                chunkFileNames:"assets/[name].js",
                assetFileNames:"assets/[name].[ext]"
            },
        },
    },
});
